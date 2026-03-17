import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("🚀 Report generation request received (MOCKED). Enqueuing job...");

    const body = await req.json();
    const { audioUrl, sessionId, stage, evalPrompt } = body;

    if (!audioUrl || !sessionId || !stage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock successful queueing
    const mockMessageId = `mock-msg-${Math.random().toString(36).substring(7)}`;
    console.log("✅ Report generation queued successfully (MOCKED). MessageId:", mockMessageId);

    return NextResponse.json({
      success: true,
      message: "Report generation queued",
      messageId: mockMessageId,
    });
  } catch (err: any) {
    console.error("❌ Error queuing report generation (MOCKED):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
