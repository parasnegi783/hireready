import type { NormalizedJob } from "@/types";
import { stripHtml, makeJobId } from "../utils";

export async function fetchFromRemotive(
  query: string,
): Promise<NormalizedJob[]> {
  try {
    const url = new URL("https://remotive.com/api/remote-jobs");
    url.searchParams.set("search", query);
    url.searchParams.set("limit", "20");

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const data = await res.json();

    return (data.jobs || []).map(
      (job: {
        id: number;
        url: string;
        title: string;
        company_name: string;
        candidate_required_location: string;
        salary: string;
        tags: string[];
        publication_date: string;
        job_type: string;
        description: string;
      }): NormalizedJob => ({
        id: makeJobId("remotive", job.id),
        source: "remotive",
        externalId: String(job.id),
        url: job.url,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote",
        remote: true,
        salary: job.salary || null,
        description: stripHtml(job.description || ""),
        tags: (job.tags || []).slice(0, 6),
        postedAt: job.publication_date,
        employmentType: job.job_type || null,
      }),
    );
  } catch (e) {
    console.warn("Remotive adapter failed:", e);
    return [];
  }
}
