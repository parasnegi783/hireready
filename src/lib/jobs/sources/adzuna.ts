import type { NormalizedJob } from "@/types";
import { makeJobId } from "../utils";

export async function fetchFromAdzuna(
  query: string,
): Promise<NormalizedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn("Adzuna: missing ADZUNA_APP_ID or ADZUNA_APP_KEY");
    return [];
  }

  try {
    const url = new URL("https://api.adzuna.com/v1/api/jobs/in/search/1");
    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set("what", query);
    url.searchParams.set("results_per_page", "20");

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return [];

    const data = await res.json();

    return (data.results || []).map(
      (job: {
        id: string;
        title: string;
        location: { display_name: string };
        redirect_url: string;
        description: string;
        created: string;
        company: { display_name: string };
        salary_min?: number;
        salary_max?: number;
        contract_time?: string;
      }): NormalizedJob => {
        const salaryParts: string[] = [];
        if (job.salary_min) salaryParts.push(`₹${Math.round(job.salary_min).toLocaleString()}`);
        if (job.salary_max) salaryParts.push(`₹${Math.round(job.salary_max).toLocaleString()}`);

        return {
          id: makeJobId("adzuna", job.id),
          source: "adzuna",
          externalId: String(job.id),
          url: job.redirect_url,
          title: job.title,
          company: job.company?.display_name || "Unknown",
          location: job.location?.display_name || "India",
          remote: false,
          salary: salaryParts.length ? salaryParts.join(" - ") : null,
          description: job.description || "",
          tags: [],
          postedAt: job.created,
          employmentType: job.contract_time || null,
        };
      },
    );
  } catch (e) {
    console.warn("Adzuna adapter failed:", e);
    return [];
  }
}
