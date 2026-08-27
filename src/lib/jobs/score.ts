import type { NormalizedJob, ScoredJob } from "@/types";
import { askAI } from "@/lib/ai";
import { JOB_FIT_PROMPT, fillPrompt } from "@/lib/prompts";
import { tryParseJSON } from "@/lib/ai-json";

export const MAX_JOBS_TO_SCORE = 30;

export async function scoreJob(
  resumeText: string,
  job: NormalizedJob,
): Promise<ScoredJob> {
  try {
    const prompt = fillPrompt(JOB_FIT_PROMPT, {
      resume: resumeText.substring(0, 3000),
      title: job.title,
      description: job.description.substring(0, 2000),
    });

    const response = await askAI(prompt, {
      maxTokens: 500,
      temperature: 0.2,
      systemPrompt:
        "You are a career matching engine. Respond with ONLY a valid JSON object. No text before or after.",
    });

    const parsed = tryParseJSON(response);

    if (!parsed || typeof parsed.fitScore !== "number") {
      return {
        ...job,
        fitScore: 0,
        matchedSkills: [],
        missingSkills: [],
        fitReason: "Scoring unavailable",
        experienceMatch: "match",
      };
    }

    return {
      ...job,
      fitScore: Math.min(100, Math.max(0, Math.round(parsed.fitScore))),
      matchedSkills: parsed.matchedSkills || [],
      missingSkills: parsed.missingSkills || [],
      fitReason: parsed.fitReason || "",
      experienceMatch: parsed.experienceMatch || "match",
    };
  } catch (e) {
    console.warn(`Scoring failed for "${job.title}":`, e);
    return {
      ...job,
      fitScore: 0,
      matchedSkills: [],
      missingSkills: [],
      fitReason: "Scoring unavailable",
      experienceMatch: "match",
    };
  }
}

export async function scoreJobs(
  resumeText: string,
  jobs: NormalizedJob[],
  options?: { batchSize?: number; delayMs?: number },
): Promise<ScoredJob[]> {
  const batchSize = options?.batchSize ?? 5;
  const delayMs = options?.delayMs ?? 500;
  const scored: ScoredJob[] = [];

  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((job) => scoreJob(resumeText, job)),
    );
    scored.push(...results);

    if (i + batchSize < jobs.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  scored.sort((a, b) => b.fitScore - a.fitScore);
  return scored;
}
