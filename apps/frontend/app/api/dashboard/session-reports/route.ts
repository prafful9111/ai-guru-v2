import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

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

    // Build search conditions
    const searchConditions: any[] = [];
    if (search) {
      searchConditions.push(
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { staffId: { contains: search, mode: "insensitive" } } },
        { scenario: { title: { contains: search, mode: "insensitive" } } },
        { id: { contains: search, mode: "insensitive" } },
      );
    }

    // Build filter conditions
    const filterConditions: any = {};
    if (city) {
      filterConditions.user = {
        ...filterConditions.user,
        city: { equals: city, mode: "insensitive" },
      };
    }
    if (unit) {
      filterConditions.user = {
        ...filterConditions.user,
        unit: { equals: unit, mode: "insensitive" },
      };
    }
    if (department) {
      filterConditions.user = {
        ...filterConditions.user,
        department: { equals: department, mode: "insensitive" },
      };
    }

    // Date range filter
    if (startDate || endDate) {
      filterConditions.startedAt = {};
      if (startDate) {
        filterConditions.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to include the end date fully
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        filterConditions.startedAt.lte = endDateObj;
      }
    }

    // Scenario filter
    if (scenarioId) {
      filterConditions.scenarioId = scenarioId;
    }

    // Difficulty filter
    if (difficulty) {
      filterConditions.difficultyLevel = {
        equals: difficulty,
        mode: "insensitive",
      };
    }

    // Combine search and filter conditions
    let where: any = {};
    if (search && Object.keys(filterConditions).length > 0) {
      where = { AND: [{ OR: searchConditions }, filterConditions] };
    } else if (search) {
      where = { OR: searchConditions };
    } else if (Object.keys(filterConditions).length > 0) {
      where = filterConditions;
    }

    where = { user: { role: { not: "ADMIN" } }, ...where };
    where = { ...where, status: { equals: "completed" } };
    where = { ...where, totalDurationSeconds: { gte: 60 } };

    // For RAG status filter, we need to fetch all matching records first and filter after transformation
    // because RAG status is computed from assessmentScores
    const needsRagFilter = !!ragStatus;

    // Fetch sessions with related data (fetch more if we need to filter by RAG status)
    const sessions = await prisma.assessmentSession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            staffId: true,
            department: true,
            unit: true,
          },
        },
        scenario: {
          select: {
            id: true,
            title: true,
          },
        },
        stageResults: {
          select: {
            id: true,
            stage: true,
            audioUrl: true,
            videoUrl: true,
            durationSeconds: true,
          },
        },
        evaluationResults: {
          select: {
            id: true,
            stage: true,
            evalResult: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    // Transform data to include computed fields
    const sessionReports = sessions.map((session) => {
      // Extract scores from assessmentScores JSON
      const assessmentScores = session.assessmentScores as any;

      // Calculate parameter score from evaluation results
      let parameterScore = 0;
      let sopScore = 0;
      let finalScore = 0;
      let ragStatus: "RED" | "AMBER" | "GREEN" = "RED";

      if (assessmentScores) {
        finalScore = assessmentScores.total_score || 0;
        parameterScore =
          assessmentScores.score_breakdown?.parameters_points_out_of_70 || 0;
        sopScore =
          assessmentScores.score_breakdown?.roleplay_sop_score_out_of_30 || 0;

        // Determine RAG status based on pass/fail or score
        if (assessmentScores.rag_status === "green") {
          ragStatus = "GREEN";
        } else if (assessmentScores.rag_status === "amber") {
          ragStatus = "AMBER";
        } else {
          ragStatus = "RED";
        }
      }

      // Get roleplay audio URL
      const roleplayStage = session.stageResults.find(
        (sr) => sr.stage === "roleplay" || sr.stage === "Roleplay",
      );
      const audioUrl = roleplayStage?.audioUrl || null;

      return {
        sessionId: session.id,
        dateTime: session.startedAt,
        completedAt: session.completedAt,
        difficulty: session.difficultyLevel,
        language: session.language,
        status: session.status,
        totalDurationSeconds: session.totalDurationSeconds,
        // User info
        userId: session.user.id,
        staffId: session.user.staffId,
        userName: session.user.name,
        userDepartment: session.user.department,
        userUnit: session.user.unit,
        // Scenario info
        scenarioId: session.scenario.id,
        scenarioTitle: session.scenario.title,
        // Evaluation info
        finalScore,
        parameterScore,
        sopScore,
        ragStatus,
        // Actions
        audioUrl,
        hasVideo: session.stageResults.some((sr) => sr.videoUrl),
      };
    });

    // Filter by RAG status if specified
    let filteredReports = sessionReports;
    if (ragStatus) {
      filteredReports = sessionReports.filter(
        (report) => report.ragStatus === ragStatus.toUpperCase(),
      );
    }

    // Calculate RAG counts from filtered reports
    // If RAG status filter is applied, only show count for that status
    const ragCounts = {
      total: filteredReports.length,
      green: ragStatus
        ? ragStatus.toUpperCase() === "GREEN"
          ? filteredReports.length
          : 0
        : sessionReports.filter((r) => r.ragStatus === "GREEN").length,
      amber: ragStatus
        ? ragStatus.toUpperCase() === "AMBER"
          ? filteredReports.length
          : 0
        : sessionReports.filter((r) => r.ragStatus === "AMBER").length,
      red: ragStatus
        ? ragStatus.toUpperCase() === "RED"
          ? filteredReports.length
          : 0
        : sessionReports.filter((r) => r.ragStatus === "RED").length,
    };

    // Apply pagination after filtering
    const totalSessions = filteredReports.length;
    const totalPages = Math.ceil(totalSessions / limit);
    const paginatedReports = filteredReports.slice(skip, skip + limit);

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
