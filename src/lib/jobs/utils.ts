import type { NormalizedJob } from "@/types";

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

export function stripHtml(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|li|h[1-6]|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/gi, (match) => ENTITY_MAP[match.toLowerCase()] ?? match)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

export function makeJobId(source: string, externalId: string | number): string {
  return `${source}_${String(externalId)}`;
}

function normalizeKey(title: string, company: string): string {
  return `${title}__${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function dedupeJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Map<string, NormalizedJob>();
  const seenIds = new Set<string>();

  for (const job of jobs) {
    if (seenIds.has(job.id)) continue;
    seenIds.add(job.id);

    const key = normalizeKey(job.title, job.company);
    const existing = seen.get(key);
    if (!existing || job.description.length > existing.description.length) {
      seen.set(key, job);
    }
  }

  return Array.from(seen.values());
}
