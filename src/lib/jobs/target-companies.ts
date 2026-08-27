import type { TargetCompany, JobSearchProfile } from "@/types";

/**
 * How to find a boardToken:
 * - Greenhouse: visit boards.greenhouse.io/COMPANY → the COMPANY slug is the token
 * - Lever: visit jobs.lever.co/COMPANY → the COMPANY slug is the token
 * - Ashby: visit jobs.ashbyhq.com/COMPANY → the COMPANY slug is the token
 *
 * Verify each token is live before relying on it — companies change ATS providers.
 */
export const DEFAULT_TARGET_COMPANIES: TargetCompany[] = [
  { name: "Cloudflare", ats: "greenhouse", boardToken: "cloudflare" },
  { name: "Figma", ats: "greenhouse", boardToken: "figma" },
  { name: "Notion", ats: "greenhouse", boardToken: "notion" },
  { name: "Vercel", ats: "greenhouse", boardToken: "vercel" },
  { name: "Supabase", ats: "ashby", boardToken: "supabase" },
];

export const DEFAULT_SEARCH_PROFILE: JobSearchProfile = {
  keywords: ["software engineer", "full stack", "react", "node", "python"],
  titles: ["Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer"],
  locations: ["India", "Remote", "Bengaluru"],
  experienceYears: 1,
  targetCompanies: DEFAULT_TARGET_COMPANIES,
  minFitScore: 0,
};
