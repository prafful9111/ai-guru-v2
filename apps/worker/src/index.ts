import "dotenv/config";

import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { prisma } from "@repo/database";
import { getPresignedGetUrl } from "./s3-helper";

// Configuration
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || "";
const AWS_REGION = process.env.AWS_REGION || "";

// SQS Client
const sqsClient = new SQSClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const SOP_TAG_POINTS: Record<string, number> = {
  "Very Weak": 0,
  Weak: 5,
  Average: 8,
  Good: 12,
  "Very Good": 15,
};

// Helper Functions
function calculateAssessmentScores(roleplayEval: any, examinerEval: any) {
  let parametersPoints = 0;
  let overallParametersPoints = 0;
  let obtainedScore = 0;

  const paramScoresObj =
    roleplayEval?.parameter_scores ||
    roleplayEval?.roleplayEvaluation?.parameter_scores;

  if (paramScoresObj) {
    const scores: number[] = [];

    Object.values(paramScoresObj).forEach((param: any) => {
      const val = param?.score;
      // Skip N/A scores
      if (val !== undefined && val !== null && val !== "N/A") {
        const numVal = Number(val);
        if (!isNaN(numVal)) scores.push(numVal);
      }
    });

    const PARAM_SCORE_WEIGHTAGE = 10;
    if (scores.length) {
      obtainedScore = scores.reduce((a, b) => a + b, 0);
      overallParametersPoints = scores.length * PARAM_SCORE_WEIGHTAGE;

      parametersPoints = (obtainedScore / overallParametersPoints) * 100;
    }
  }

  parametersPoints = Math.round(parametersPoints);

  // New format: sop_adherence.score_out_of_30 → map to 15 points
  // Fallback: use tag-based points for backward compatibility
  let roleplaySopPoints: number;
  const roleplaySopRaw = roleplayEval?.sop_adherence;
  // if (roleplaySopRaw?.score_out_of_30 !== undefined && roleplaySopRaw?.score_out_of_30 !== null) {
  //   roleplaySopPoints = Math.round((Number(roleplaySopRaw.score_out_of_30) / 30) * 15);
  // } else {
  const roleplaySopTag = roleplaySopRaw?.tag ?? "Very Weak";
  roleplaySopPoints = SOP_TAG_POINTS[roleplaySopTag] ?? 0;
  // }

  // Examiner eval uses old format (sop_steps_remembering.tag)
  const examinerSopTag =
    examinerEval?.sop_steps_remembering?.tag ?? "Very Weak";
  const examinerSopPoints = SOP_TAG_POINTS[examinerSopTag] ?? 0;

  let totalScore = parametersPoints;
  totalScore = Math.min(100, Math.max(0, totalScore));

  let ragStatus: "red" | "green" | "amber" = "red";

  if (parametersPoints >= 80) ragStatus = "green";
  if (parametersPoints > 60 && parametersPoints < 80) ragStatus = "amber";

  return {
    total_score: totalScore,
    pass_fail: totalScore >= 60 ? "Pass" : "Fail",
    rag_status: ragStatus,
    score_breakdown: {
      total_percentage: parametersPoints,
      overall_parameters_points: overallParametersPoints,
      obtained_score: obtainedScore,
      parameters_points_out_of_70: parametersPoints,
      roleplay_sop_points_out_of_15: roleplaySopPoints,
      roleplay_sop_score_out_of_30: roleplaySopRaw?.score_out_of_30 ?? null,
      roleplay_sop_tag: roleplaySopRaw?.tag ?? null,
      examiner_sop_points_out_of_15: examinerSopPoints,
    },
  };
}

function extractJSON(text: string) {
  const match = text.match(/```json\n?([\s\S]*?)\n?```/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return text.trim();
}

// Worker Class
class Worker {
  private isRunning: boolean = false;
  private readonly model: string = "gemini-3-flash-preview";

  public async start() {
    this.isRunning = true;
    console.log(
      `Worker started. Listening for messages on ${SQS_QUEUE_URL}...`,
    );

    this.setupGracefulShutdown();

    while (this.isRunning) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 300, // Hide message for 5 minutes during processing
        });

        const response = await sqsClient.send(command);

        if (response.Messages && response.Messages.length > 0) {
          console.log(`Received ${response.Messages.length} messages.`);
          for (const message of response.Messages) {
            const success = await this.processMessage(message);
            if (success) {
              await this.deleteMessage(message);
            }
          }
        }
      } catch (error) {
        if (this.isRunning) {
          console.error("Error receiving messages:", error);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    console.log("Worker stopped loop.");
  }

  private async processMessage(message: Message): Promise<boolean> {
    if (!message.Body) return true; // Treat empty body as processed so we delete it

    const messageId = message.MessageId;
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📨 Processing message: ${messageId}`);
    console.log(`${"=".repeat(60)}`);

    try {
      // todo: evalprompt should come from database directly
      const { audioUrl, sessionId, stage, evalPrompt } = JSON.parse(
        message.Body,
      );

      if (!audioUrl || !sessionId || !stage) {
        console.error(`❌ Invalid message body in ${messageId}:`, message.Body);
        return true; // Invalid message, delete it to avoid poison pill
      }

      console.log(`📋 Session : ${sessionId}`);
      console.log(`📋 Stage   : ${stage}`);
      console.log(`📋 AudioURL: ${audioUrl}`);
      console.log(
        `📋 evalPrompt present: ${!!evalPrompt} (length: ${evalPrompt?.length ?? 0})`,
      );

      if (!evalPrompt) {
        console.warn(
          `⚠️  evalPrompt is NULL/EMPTY for stage "${stage}" — evaluation will be SKIPPED!`,
        );
        return true;
      }

      const isValidStage = stage === "roleplay" || stage === "test";

      /* ─── Idempotency Check ─── */
      // if (isValidStage) {
      //   const existing = await prisma.evaluationResult.findFirst({
      //     where: { sessionId, stage },
      //   });
      //   if (existing) {
      //     console.warn(
      //       `⏭️  Duplicate job detected for ${sessionId}/${stage} — eval already exists. Skipping.`,
      //     );
      //     return true; // delete the duplicate message
      //   }
      // }

      // eval prompt is there but stage is no valid
      if (!isValidStage && evalPrompt) {
        console.warn(
          `⚠️  Skipping Steps 3/4: evalPrompt is ${evalPrompt ? "present but stage not roleplay/test" : "MISSING"}`,
        );
        return true;
      }

      const { presignedUrl, mimeType } = await getPresignedGetUrl(audioUrl);

      const response = await ai.models.generateContent({
        model: this.model,
        contents: [
          {
            role: "user",
            parts: [
              { text: evalPrompt },
              {
                fileData: {
                  fileUri: presignedUrl,
                  mimeType: mimeType,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MEDIUM,
          },
        },
      });

      if (!response.text) {
        throw new Error("Gemini returned empty response text");
      }

      const evalResult = this.parseJsonStrict(response.text);

      await prisma.evaluationResult.create({
        data: {
          sessionId,
          stage,
          evalPrompt,
          evalResult: evalResult as any,
        },
      });

      /* ─── Step 4: Score Calculation ─── */
      console.log(`\n── Step 4: Calculating scores ──`);

      const allEvals = await prisma.evaluationResult.findMany({
        where: { sessionId },
      });

      console.log(
        `Found ${allEvals.length} eval(s) for session:`,
        allEvals.map((e: any) => e.stage).join(", "),
      );

      const roleplayEval =
        allEvals.find((e: any) => e.stage === "roleplay")?.evalResult || {};
      const examinerEval =
        allEvals.find((e: any) => e.stage === "test")?.evalResult || {};

      console.log("\n---------------------");
      console.log("roleplayEval keys:", Object.keys(roleplayEval as object));
      console.log("examinerEval keys:", Object.keys(examinerEval as object));
      console.log("\n---------------------");

      const scores = calculateAssessmentScores(roleplayEval, examinerEval);
      console.log("✅ Calculated scores:", JSON.stringify(scores, null, 2));

      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: { assessmentScores: scores },
      });
      console.log(`💾 assessmentScores saved to session`);

      console.log(`\n✅ Job complete for message ${messageId}`);
      return true;
    } catch (error) {
      console.error(`\n❌ Error processing message ${messageId}:`, error);
      return false; // Return false to indicate failure (message won't be deleted)
    }
  }

  private parseJsonStrict(value: string): unknown {
    if (!value) {
      throw new Error("Gemini returned empty response text");
    }

    try {
      return JSON.parse(value);
    } catch {
      console.error("direct JSON parsing failed! trying with extraction...");
    }

    try {
      return JSON.parse(extractJSON(value));
    } catch {
      const preview = value.length > 200 ? `${value.slice(0, 200)}...` : value;
      throw new Error(`Gemini returned invalid JSON: ${preview}`);
    }
  }

  private async deleteMessage(message: Message) {
    if (!message.ReceiptHandle) return;

    try {
      const command = new DeleteMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      });
      await sqsClient.send(command);
      console.log("Message deleted from queue:", message.MessageId);
    } catch (error) {
      console.error("Error deleting message:", message.MessageId, error);
    }
  }

  private setupGracefulShutdown() {
    const shutdown = () => {
      console.log("\nReceived shutdown signal. Gracefully shutting down...");
      this.isRunning = false;
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }
}

const worker = new Worker();
worker.start().catch((err) => {
  console.error("Fatal error starting worker:", err);
  process.exit(1);
});
