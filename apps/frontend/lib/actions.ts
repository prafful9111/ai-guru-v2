
"use server";

import { prisma } from "@repo/database";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export async function createAssessmentSession(
    userId: string,
    scenarioId: string,
    difficultyLevel: string,
    language: string
) {
    try {
        const session = await prisma.assessmentSession.create({
            data: {
                userId,
                scenarioId,
                difficultyLevel,
                language,
                status: "in_progress",
            },
        });
        return { success: true, id: session.id };
    } catch (error) {
        console.error("Failed to create session:", error);
        return { success: false, error: String(error) };
    }
}

export async function saveStageResult(
    sessionId: string,
    stage: string,
    transcript: string | null,
    audioUrl: string | null,
    videoUrl: string | null,
    durationSeconds: number
) {
    try {
        const result = await prisma.stageResult.create({
            data: {
                sessionId,
                stage,
                transcript,
                audioUrl,
                videoUrl,
                durationSeconds,
            },
        });
        return { success: true, id: result.id };
    } catch (error) {
        console.error(`Failed to save ${stage} result:`, error);
        return { success: false, error: String(error) };
    }
}

export async function completeAssessmentSession(
    sessionId: string,
    totalDurationSeconds: number
) {
    try {
        await prisma.assessmentSession.update({
            where: { id: sessionId },
            data: {
                status: "completed",
                totalDurationSeconds,
                completedAt: new Date(),
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to complete session:", error);
        return { success: false, error: String(error) };
    }
}

export async function uploadAudio(
    sessionId: string,
    stage: string,
    formData: FormData
) {
    const file = formData.get("file") as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    console.log(`Uploading audio for stage ${stage}... File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB (${file.size} bytes)`);

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${sessionId}_${stage}_${Date.now()}.webm`;
        const key = `uploads/${filename}`;
        const bucket = process.env.AWS_BUCKET_NAME;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type || "audio/webm",
        });

        await s3Client.send(command);
        
        // Return public URL
        const region = process.env.AWS_REGION || "ap-south-1";
        const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        
        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("Upload failed:", error);
        return { success: false, error: String(error) };
    }
}

export async function uploadVideo(
    sessionId: string,
    stage: string,
    formData: FormData
) {
    const file = formData.get("file") as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}.webm`;
        const key = `${sessionId}/${stage}/${filename}`;

        const command = new PutObjectCommand({
            Bucket: "lnd-video-prod",
            Key: key,
            Body: buffer,
            ContentType: file.type || "video/webm",
        });

        await s3Client.send(command);
        
        // Return public URL
        const region = process.env.AWS_REGION || "ap-south-1";
        const publicUrl = `https://lnd-video-prod.s3.${region}.amazonaws.com/${key}`;
        
        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("Video upload failed:", error);
        return { success: false, error: String(error) };
    }
}

export async function getGeminiToken() {
    // In a real app, implement proper token generation or proxying to avoid exposing keys,
    // or use a secure backend proxy for the WebSocket connection.
    // For this migration, we'll try to use an environment variable if available,
    // or provide a placeholder that the user needs to fill.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is not set in environment variables.");
        return { success: false, error: "API Key not configured" };
    }
    return { success: true, token: apiKey };
}

export async function getSessionWithScenario(sessionId: string) {
    try {
        const session = await prisma.assessmentSession.findUnique({
            where: { id: sessionId },
            include: { 
                scenario: true,
                user: true 
            },
        });
        
        if (!session) return { success: false, error: "Session not found" };

        // Transform for frontend if needed, but Prisma types should align mostly
        // Note: Prisma returns snake_case if mapped in schema, but typical usage with @prisma/client is camelCase properties
        // The schema has @@map which maps table names, but fields are camelCase in the model definition.
        // So `session` will have camelCase properties like `difficultyLevel` not `difficulty_level`.
        // We might need to map them to match what the frontend expects if it was built for Supabase (snake_case).
        
        // Let's return as is and update frontend to use camelCase, or map here.
        // The existing frontend expects snake_case from Supabase.
        // Let's map it to snake_case to minimize frontend churn in this step.
        
        return {
            success: true,
            data: {
                ...session,
                scenarios: session.scenario, // Map scenario relation to scenarios (plural) if frontend expects it, or check usage
                profile: {
                    name: session.user.name,
                    role: session.user.role,
                    user_id: session.user.id,
                    staff_id: session.user.staffId 
                }
            }
        };
    } catch (error) {
        console.error("Get session error:", error);
        return { success: false, error: String(error) };
    }
}

export async function getStageResults(sessionId: string) {
     try {
        const results = await prisma.stageResult.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' }
        });
        
        // Map to snake_case for frontend compatibility if needed
        // Frontend uses: stage, audio_url, transcript, created_at
        return {
            success: true,
            data: results.map(r => ({
                id: r.id,
                stage: r.stage,
                transcript: r.transcript,
                audio_url: r.audioUrl,
                created_at: r.createdAt.toISOString(),
                duration_seconds: r.durationSeconds
            }))
        };
    } catch (error) {
        console.error("Get results error:", error);
        return { success: false, error: String(error) };
    }
}

export async function getEvaluationResults(sessionId: string) {
    try {
       const results = await prisma.evaluationResult.findMany({
           where: { sessionId },
           orderBy: { createdAt: 'desc' }
       });
       
       return {
           success: true,
           data: results.map(r => ({
               stage: r.stage,
               eval_result: r.evalResult,
               created_at: r.createdAt.toISOString()
           }))
       };
   } catch (error) {
       console.error("Get evaluation results error:", error);
       return { success: false, error: String(error) };
   }
}
