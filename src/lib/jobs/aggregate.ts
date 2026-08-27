import type { NormalizedJob, JobSearchProfile } from "@/types";
import { dedupeJobs } from "./utils";
import { fetchFromGreenhouse } from "./sources/greenhouse";
import { fetchFromLever } from "./sources/lever";
import { fetchFromAshby } from "./sources/ashby";
import { fetchFromRemotive } from "./sources/remotive";
import { fetchFromAdzuna } from "./sources/adzuna";
import { fetchFromArbeitnow } from "./sources/arbeitnow";

const MAX_AGGREGATED_JOBS = 50;

const atsFetchers = {
  greenhouse: fetchFromGreenhouse,
  lever: fetchFromLever,
  ashby: fetchFromAshby,
} as const;

function buildQuery(profile: JobSearchProfile): string {
  return [...profile.keywords.slice(0, 2), ...profile.titles.slice(0, 1)]
    .join(" ")
    .trim();
}

function matchesProfile(job: NormalizedJob, profile: JobSearchProfile): boolean {
  const haystack = `${job.title} ${job.tags.join(" ")}`.toLowerCase();
  return (
    profile.titles.some((t) => haystack.includes(t.toLowerCase())) ||
    profile.keywords.some((k) => haystack.includes(k.toLowerCase()))
  );
}

export async function aggregateJobs(
  profile: JobSearchProfile,
): Promise<NormalizedJob[]> {
  const query = buildQuery(profile);
  const promises: Promise<NormalizedJob[]>[] = [];

  for (const company of profile.targetCompanies) {
    const fetcher = atsFetchers[company.ats];
    promises.push(fetcher(company.boardToken, company.name));
  }

  promises.push(fetchFromRemotive(query));
  promises.push(fetchFromAdzuna(query));
  promises.push(fetchFromArbeitnow(query));

  const results = await Promise.allSettled(promises);

  const atsCount = profile.targetCompanies.length;
  const allJobs: NormalizedJob[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      let jobs = result.value;
      // Pre-filter aggregator results (not ATS) by profile relevance
      if (i >= atsCount) {
        jobs = jobs.filter((j) => matchesProfile(j, profile));
      }
      allJobs.push(...jobs);
    }
  }

  const deduped = dedupeJobs(allJobs);

  deduped.sort((a, b) => {
    const dateA = new Date(a.postedAt).getTime() || 0;
    const dateB = new Date(b.postedAt).getTime() || 0;
    return dateB - dateA;
  });

  return deduped.slice(0, MAX_AGGREGATED_JOBS);
}
