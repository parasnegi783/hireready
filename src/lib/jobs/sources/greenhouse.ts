import type { NormalizedJob } from "@/types";
import { stripHtml, makeJobId } from "../utils";

export async function fetchFromGreenhouse(
  boardToken: string,
  companyName?: string,
): Promise<NormalizedJob[]> {
  try {
    const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];

    const data = await res.json();

    return (data.jobs || []).map(
      (job: {
        id: number;
        title: string;
        location: { name: string };
        absolute_url: string;
        content: string;
        updated_at: string;
        departments: { name: string }[];
      }): NormalizedJob => ({
        id: makeJobId("greenhouse", job.id),
        source: "greenhouse",
        externalId: String(job.id),
        url: job.absolute_url,
        title: job.title,
        company: companyName || boardToken,
        location: job.location?.name || "Not specified",
        remote: /remote/i.test(job.location?.name || ""),
        salary: null,
        description: stripHtml(job.content || ""),
        tags: (job.departments || []).map((d) => d.name).slice(0, 4),
        postedAt: job.updated_at,
        employmentType: null,
      }),
    );
  } catch (e) {
    console.warn(`Greenhouse adapter failed for ${boardToken}:`, e);
    return [];
  }
}
