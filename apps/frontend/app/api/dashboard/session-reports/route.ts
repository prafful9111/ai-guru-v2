import { NextResponse } from "next/server";
import { MOCK_SESSION_REPORTS, MOCK_USERS, MOCK_SCENARIOS } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";
    const unit = searchParams.get("unit") || "";
    const department = searchParams.get("department") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const ragStatus = searchParams.get("ragStatus") || "";
    const scenarioId = searchParams.get("scenarioId") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const skip = (page - 1) * limit;

    // Build base reports
    let sessionReports = MOCK_SESSION_REPORTS.map((session) => {
        const user = MOCK_USERS.find(u => u.id === session.userId) || { id: 'unknown_user_id', name: 'Unknown', staffId: 'UKNWN', department: 'Unknown', unit: 'Unknown', city: 'Unknown', role: 'STAFF' };
        const scenario = MOCK_SCENARIOS.find(s => s.id === session.scenarioId) || { id: session.scenarioId, title: 'Unknown Scenario' };
        
        // Random mock scores for demonstration
        const finalScore = Math.floor(Math.random() * 40) + 60;
        const parameterScore = Math.floor(finalScore * 0.7);
        const sopScore = Math.floor(finalScore * 0.3);
        
        let calculatedRagStatus: "RED" | "AMBER" | "GREEN" = "RED";
        if (finalScore >= 80) calculatedRagStatus = "GREEN";
        else if (finalScore >= 65) calculatedRagStatus = "AMBER";

        return {
            sessionId: session.id,
            dateTime: session.createdAt,
            completedAt: session.completedAt,
            difficulty: session.difficultyLevel,
            language: session.language,
            status: session.status,
            totalDurationSeconds: session.totalDurationSeconds,
            userId: user.id,
            staffId: user.staffId,
            userName: user.name,
            userDepartment: user.department || '',
            userUnit: (user as any).unit || '',
            userCity: (user as any).city || '',
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            finalScore,
            parameterScore,
            sopScore,
            ragStatus: calculatedRagStatus,
            audioUrl: null,
            hasVideo: false,
        };
    });

    // Apply Filters
    if (search) {
        const s = search.toLowerCase();
        sessionReports = sessionReports.filter(r => 
            r.userName?.toLowerCase().includes(s) || 
            r.staffId?.toLowerCase().includes(s) || 
            r.scenarioTitle?.toLowerCase().includes(s)
        );
    }
    if (city) {
        sessionReports = sessionReports.filter(r => r.userCity?.toLowerCase() === city.toLowerCase());
    }
    if (unit) {
        sessionReports = sessionReports.filter(r => r.userUnit?.toLowerCase() === unit.toLowerCase());
    }
    if (department) {
        sessionReports = sessionReports.filter(r => r.userDepartment?.toLowerCase() === department.toLowerCase());
    }
    if (scenarioId) {
        sessionReports = sessionReports.filter(r => r.scenarioId === scenarioId);
    }
    if (difficulty) {
        sessionReports = sessionReports.filter(r => r.difficulty?.toLowerCase() === difficulty.toLowerCase());
    }
    
    // Dates
    if (startDate) {
        const start = new Date(startDate).getTime();
        sessionReports = sessionReports.filter(r => new Date(r.dateTime).getTime() >= start);
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        sessionReports = sessionReports.filter(r => new Date(r.dateTime).getTime() <= end.getTime());
    }

    // Filter by RAG status if specified
    if (ragStatus) {
      sessionReports = sessionReports.filter(r => r.ragStatus === ragStatus.toUpperCase());
    }

    const ragCounts = {
      total: sessionReports.length,
      green: sessionReports.filter((r) => r.ragStatus === "GREEN").length,
      amber: sessionReports.filter((r) => r.ragStatus === "AMBER").length,
      red: sessionReports.filter((r) => r.ragStatus === "RED").length,
    };

    const totalSessions = sessionReports.length;
    const totalPages = Math.ceil(totalSessions / limit);
    const paginatedReports = sessionReports.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginatedReports,
      meta: {
        total: totalSessions,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      stats: ragCounts,
    });
  } catch (error) {
    console.error("Session reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
