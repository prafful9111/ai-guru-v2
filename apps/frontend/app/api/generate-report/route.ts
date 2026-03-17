import { NextResponse } from "next/server";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "",
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  try {
    console.log("🚀 Report generation request received. Enqueuing job...");

    const body = await req.json();
    const { audioUrl, sessionId, stage, evalPrompt } = body;

    if (!audioUrl || !sessionId || !stage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL || "",
      MessageBody: JSON.stringify({ audioUrl, sessionId, stage, evalPrompt }),
    });

    const response = await sqsClient.send(command);

    console.log("✅ Report generation queued successfully. MessageId:", response.MessageId);

    return NextResponse.json({
      success: true,
      message: "Report generation queued",
      messageId: response.MessageId,
    });
  } catch (err: any) {
    console.error("❌ Error queuing report generation:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
