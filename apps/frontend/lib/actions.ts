
"use server";

import { MOCK_SCENARIOS, MOCK_USERS } from "@/lib/mock-data";

export async function createAssessmentSession(
    userId: string,
    scenarioId: string,
    difficultyLevel: string,
    language: string
) {
    try {
        console.log(`Mocking session creation for ${userId} on scenario ${scenarioId}`);
        return { success: true, id: "MOCK_SESSION_" + Date.now() };
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
        console.log(`Mocking saving stage result for session ${sessionId}, stage: ${stage}`);
        return { success: true, id: "MOCK_STAGE_RESULT_" + Date.now() };
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
        console.log(`Mocking completion of session ${sessionId} with duration ${totalDurationSeconds}s`);
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
        const filename = `${sessionId}_${stage}_${Date.now()}.webm`;
        const bucket = process.env.AWS_BUCKET_NAME || "mock-bucket";
        // Mock successful upload without S3
        
        // Return public URL
        const region = process.env.AWS_REGION || "ap-south-1";
        const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/uploads/${filename}`;
        
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
        const filename = `${Date.now()}.webm`;
        const key = `${sessionId}/${stage}/${filename}`;
        // Mock successful upload without S3
        
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
        // Mock a session structure since we are offline
        const mockUser = MOCK_USERS[0] || { id: "u1", name: "Guest", role: "STAFF", staffId: "000" } as any;
        const mockScenario = MOCK_SCENARIOS[0] || { id: "s1" } as any;
        
        return {
            success: true,
            data: {
                id: sessionId,
                userId: mockUser.id,
                scenarioId: mockScenario.id,
                status: "completed",
                startedAt: new Date(),
                totalDurationSeconds: 150,
                scenarios: mockScenario,
                profile: {
                    name: mockUser.name,
                    role: mockUser.role,
                    user_id: mockUser.id,
                    staff_id: mockUser.staffId 
                },
                assessmentScores: {
                    rag_status: "GREEN",
                    score_breakdown: {
                        total_percentage: 85,
                        obtained_score: 85,
                        overall_parameters_points: 100
                    }
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
        return {
            success: true,
            data: [
                {
                    id: "mock-result-1",
                    stage: "Introduction",
                    transcript: "Hello there.",
                    audio_url: null,
                    created_at: new Date().toISOString(),
                    duration_seconds: 12
                }
            ]
        };
    } catch (error) {
        console.error("Get results error:", error);
        return { success: false, error: String(error) };
    }
}

export async function getEvaluationResults(sessionId: string) {
    try {
       return {
           success: true,
           data: [
               {
                   stage: "Introduction",
                   eval_result: "Good",
                   created_at: new Date().toISOString()
               }
           ]
       };
   } catch (error) {
       console.error("Get evaluation results error:", error);
       return { success: false, error: String(error) };
   }
}

