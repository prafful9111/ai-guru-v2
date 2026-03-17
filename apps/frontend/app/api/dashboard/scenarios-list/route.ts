import { NextResponse } from "next/server";
import { MOCK_SCENARIOS } from "@/lib/mock-data";

export async function GET() {
  try {
    const response = MOCK_SCENARIOS.map((scenario) => ({
      id: scenario.id,
      name: scenario.title,
    })).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching scenarios list:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 },
    );
  }
}
