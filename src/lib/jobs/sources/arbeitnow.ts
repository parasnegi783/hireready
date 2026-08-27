import type { NormalizedJob } from "@/types";
import { makeJobId } from "../utils";

export async function fetchFromArbeitnow(
  query: string,
): Promise<NormalizedJob[]> {
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const data = await res.json();

    const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);

    return (data.data || [])
      .filter(
        (job: { title: string; tags: string[] }) => {
          const haystack = `${job.title} ${(job.tags || []).join(" ")}`.toLowerCase();
          return queryWords.some((w) => haystack.includes(w));
        },
      )
      .slice(0, 20)
      .map(
        (job: {
          slug: string;
          title: string;
          company_name: string;
          location: string;
          url: string;
          description: string;
          created_at: string;
          remote: boolean;
          tags: string[];
        }): NormalizedJob => ({
          id: makeJobId("arbeitnow", job.slug),
          source: "arbeitnow",
          externalId: job.slug,
          url: job.url,
          title: job.title,
          company: job.company_name,
          location: job.location || "Not specified",
          remote: job.remote,
          salary: null,
          description: job.description || "",
          tags: (job.tags || []).slice(0, 6),
          postedAt: job.created_at,
          employmentType: null,
        }),
      );
  } catch (e) {
    console.warn("Arbeitnow adapter failed:", e);
    return [];
  }
}
