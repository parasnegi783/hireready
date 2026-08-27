import { NextRequest, NextResponse } from "next/server";
import type { JobSearchProfile } from "@/types";
import { aggregateJobs } from "@/lib/jobs/aggregate";
import { DEFAULT_SEARCH_PROFILE } from "@/lib/jobs/target-companies";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "software engineer";

  try {
    const profile: JobSearchProfile = {
      ...DEFAULT_SEARCH_PROFILE,
      keywords: [query],
      titles: [query],
    };

    const jobs = await aggregateJobs(profile);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Jobs search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile: JobSearchProfile = {
      ...DEFAULT_SEARCH_PROFILE,
      ...body,
    };

    const jobs = await aggregateJobs(profile);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Jobs search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
