import type { NormalizedJob } from "@/types";
import { makeJobId } from "../utils";

export async function fetchFromLever(
  boardToken: string,
  companyName?: string,
): Promise<NormalizedJob[]> {
  try {
    const url = `https://api.lever.co/v0/postings/${boardToken}?mode=json`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map(
      (job: {
        id: string;
        text: string;
        categories: {
          location?: string;
          commitment?: string;
          team?: string;
        };
        hostedUrl: string;
        descriptionPlain: string;
        createdAt: number;
      }): NormalizedJob => ({
        id: makeJobId("lever", job.id),
        source: "lever",
        externalId: job.id,
        url: job.hostedUrl,
        title: job.text,
        company: companyName || boardToken,
        location: job.categories?.location || "Not specified",
        remote: /remote/i.test(job.categories?.location || ""),
        salary: null,
        description: job.descriptionPlain || "",
        tags: job.categories?.team ? [job.categories.team] : [],
        postedAt: new Date(job.createdAt).toISOString(),
        employmentType: job.categories?.commitment || null,
      }),
    );
  } catch (e) {
    console.warn(`Lever adapter failed for ${boardToken}:`, e);
    return [];
  }
}
