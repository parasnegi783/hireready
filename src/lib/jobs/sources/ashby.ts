import type { NormalizedJob } from "@/types";
import { makeJobId } from "../utils";

export async function fetchFromAshby(
  boardToken: string,
  companyName?: string,
): Promise<NormalizedJob[]> {
  try {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${boardToken}?includeCompensation=true`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];

    const data = await res.json();

    return (data.jobs || []).map(
      (job: {
        id: string;
        title: string;
        location: string;
        jobUrl: string;
        descriptionPlain: string;
        publishedAt: string;
        compensationTierSummary?: string;
        department?: string;
      }): NormalizedJob => ({
        id: makeJobId("ashby", job.id),
        source: "ashby",
        externalId: job.id,
        url: job.jobUrl,
        title: job.title,
        company: companyName || boardToken,
        location: job.location || "Not specified",
        remote: /remote/i.test(job.location || ""),
        salary: job.compensationTierSummary || null,
        description: job.descriptionPlain || "",
        tags: job.department ? [job.department] : [],
        postedAt: job.publishedAt,
        employmentType: null,
      }),
    );
  } catch (e) {
    console.warn(`Ashby adapter failed for ${boardToken}:`, e);
    return [];
  }
}
