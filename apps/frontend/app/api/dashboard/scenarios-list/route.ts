import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: "asc" },
    });

    // Transform to match expected response format
    const response = scenarios.map((scenario) => ({
      id: scenario.id,
      name: scenario.title,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching scenarios list:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 },
    );
  }
}
