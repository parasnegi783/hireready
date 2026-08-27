import { NextRequest, NextResponse } from "next/server";
import type { JobSearchProfile } from "@/types";
import { aggregateJobs } from "@/lib/jobs/aggregate";
import { scoreJobs, MAX_JOBS_TO_SCORE } from "@/lib/jobs/score";
import { DEFAULT_SEARCH_PROFILE } from "@/lib/jobs/target-companies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText } = body;

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: "Resume text is required (at least 50 characters)" },
        { status: 400 },
      );
    }

    const profile: JobSearchProfile = {
      ...DEFAULT_SEARCH_PROFILE,
      ...body.profile,
    };

    const allJobs = await aggregateJobs(profile);
    const toScore = allJobs.slice(0, MAX_JOBS_TO_SCORE);
    const scored = await scoreJobs(resumeText, toScore);

    const filtered =
      profile.minFitScore > 0
        ? scored.filter((j) => j.fitScore >= profile.minFitScore)
        : scored;

    return NextResponse.json({
      jobs: filtered,
      total: allJobs.length,
      scored: toScore.length,
    });
  } catch (error) {
    console.error("Matched jobs API error:", error);
    return NextResponse.json(
      { error: "Failed to score jobs" },
      { status: 500 },
    );
  }
}
