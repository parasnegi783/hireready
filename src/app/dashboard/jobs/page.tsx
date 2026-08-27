"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSearch,
  IconMapPin,
  IconBriefcase,
  IconExternalLink,
  IconLoader2,
  IconWifi,
  IconCalendar,
  IconBrain,
  IconBookmark,
  IconBookmarkFilled,
  IconStar,
  IconAdjustments,
  IconChevronDown,
} from "@tabler/icons-react";
import type { NormalizedJob, ScoredJob } from "@/types";
import { useJobsStore } from "@/store/jobs-store";
import { DEFAULT_SEARCH_PROFILE } from "@/lib/jobs/target-companies";

type ViewMode = "keyword" | "matched";
type DisplayJob = NormalizedJob | ScoredJob;

const FALLBACKS = [
  "software engineer",
  "frontend developer",
  "backend developer",
  "full stack developer",
  "react developer",
];

const SOURCE_LABELS: Record<string, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  ashby: "Ashby",
  remotive: "Remotive",
  adzuna: "Adzuna",
  arbeitnow: "Arbeitnow",
};

function isScoredJob(job: DisplayJob): job is ScoredJob {
  return "fitScore" in job;
}

function getDefaultQuery(): string {
  try {
    const raw = localStorage.getItem("hireready_skills");
    if (raw) {
      const skills: string[] = JSON.parse(raw);
      if (skills.length) return skills.slice(0, 3).join(" ");
    }
  } catch {}
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function fitScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  if (score >= 60) return "text-amber-400 border-amber-500/20 bg-amber-500/10";
  return "text-slate-400 border-white/[0.08] bg-white/[0.02]";
}

export default function JobsPage() {
  const { resumeText, savedJobIds, toggleSavedJob, loadFromStorage, searchProfile } =
    useJobsStore();

  const [mode, setMode] = useState<ViewMode>("keyword");
  const [inputValue, setInputValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoringStatus, setScoringStatus] = useState("");
  const [error, setError] = useState("");
  const [minFitScore, setMinFitScore] = useState(0);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const fetchKeywordJobs = useCallback(async (q: string): Promise<NormalizedJob[]> => {
    const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(q)}&limit=20`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data.jobs || [];
  }, []);

  const fetchMatchedJobs = useCallback(async (resumeText: string): Promise<ScoredJob[]> => {
    const res = await fetch("/api/jobs/matched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, profile: searchProfile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data.jobs || [];
  }, [searchProfile]);

  async function loadKeywordJobs(userQuery: string) {
    setLoading(true);
    setError("");
    setScoringStatus("");

    const trimmed = userQuery.trim();
    const attempts = trimmed
      ? [trimmed, getDefaultQuery(), ...FALLBACKS]
      : [getDefaultQuery(), ...FALLBACKS];

    const seen = new Set<string>();
    for (const q of attempts) {
      if (seen.has(q)) continue;
      seen.add(q);
      try {
        const results = await fetchKeywordJobs(q);
        if (results.length > 0) {
          setJobs(results);
          setActiveQuery(q);
          setLoading(false);
          return;
        }
      } catch {}
    }

    setError("Could not load jobs. Check your connection.");
    setLoading(false);
  }

  async function loadMatchedJobs() {
    if (!resumeText) {
      setMode("keyword");
      setError("No resume found. Run a resume analysis first, then try AI Matched mode.");
      return;
    }

    setLoading(true);
    setError("");
    setScoringStatus("Discovering jobs across 6 sources...");

    try {
      setScoringStatus(`Scoring up to ${DEFAULT_SEARCH_PROFILE.keywords.length > 0 ? "30" : "20"} jobs against your resume (this takes ~20-30 seconds)...`);
      const results = await fetchMatchedJobs(resumeText);
      setJobs(results);
      setActiveQuery("AI-matched to your resume");
      setScoringStatus("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch matched jobs.");
      setScoringStatus("");
    }

    setLoading(false);
  }

  useEffect(() => {
    const defaultQ = getDefaultQuery();
    setInputValue(defaultQ);
    setActiveQuery(defaultQ);
    loadKeywordJobs(defaultQ);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInput(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (mode === "keyword") loadKeywordJobs(value);
    }, 700);
  }

  function handleModeChange(newMode: ViewMode) {
    setMode(newMode);
    setError("");
    if (newMode === "matched") {
      loadMatchedJobs();
    } else {
      loadKeywordJobs(inputValue || getDefaultQuery());
    }
  }

  const visibleJobs = jobs.filter((job) => {
    const scoreOk =
      !isScoredJob(job) || minFitScore === 0 || job.fitScore >= minFitScore;
    const sourceOk = sourceFilter === "all" || job.source === sourceFilter;
    return scoreOk && sourceOk;
  });

  const uniqueSources = [...new Set(jobs.map((j) => j.source))];

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Job <span className="gradient-text">Board</span>
            </h1>
            <p className="mt-1 text-sm font-light text-slate-500">
              {activeQuery
                ? (
                  <>
                    {mode === "matched"
                      ? "AI-scored matches ranked by fit"
                      : <>Showing live jobs for <span className="text-purple-400">&quot;{activeQuery}&quot;</span></>
                    }
                  </>
                )
                : "Live jobs from Greenhouse, Lever, Remotive, and more."}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5">
            <IconWifi size={12} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>
        </div>
      </motion.div>

      {/* Mode toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-5 flex items-center gap-2"
      >
        <button
          onClick={() => handleModeChange("keyword")}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "keyword"
              ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
              : "border-white/[0.08] text-slate-500 hover:border-white/[0.14] hover:text-slate-400"
          }`}
        >
          <IconSearch size={13} />
          Keyword Search
        </button>
        <button
          onClick={() => handleModeChange("matched")}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "matched"
              ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
              : "border-white/[0.08] text-slate-500 hover:border-white/[0.14] hover:text-slate-400"
          }`}
        >
          <IconBrain size={13} />
          AI Matched
          {resumeText && (
            <span className="ml-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-400">
              Resume ready
            </span>
          )}
        </button>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-white/[0.14] hover:text-slate-400"
        >
          <IconAdjustments size={13} />
          Filters
          <IconChevronDown
            size={12}
            className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </button>
      </motion.div>

      {/* Search (keyword mode only) */}
      <AnimatePresence>
        {mode === "keyword" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#111118] px-4 py-3">
              {loading ? (
                <IconLoader2 size={18} className="shrink-0 animate-spin text-purple-400" />
              ) : (
                <IconSearch size={18} className="shrink-0 text-slate-500" />
              )}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Search by title, skill, or company..."
                className="flex-1 bg-transparent text-sm font-light text-white outline-none placeholder:text-slate-600"
              />
              {jobs.length > 0 && !loading && (
                <span className="shrink-0 text-xs text-slate-600">
                  {visibleJobs.length}/{jobs.length}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-[#111118] p-4">
              <div className="flex flex-wrap items-center gap-6">
                {mode === "matched" && (
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-400">
                      Min fit score:{" "}
                      <span className="text-purple-300">{minFitScore}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={10}
                      value={minFitScore}
                      onChange={(e) => setMinFitScore(Number(e.target.value))}
                      className="w-32 accent-purple-500"
                    />
                  </div>
                )}
                {uniqueSources.length > 1 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-400">Source:</label>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="rounded-lg border border-white/[0.08] bg-[#0A0A0F] px-2 py-1 text-xs text-slate-300 outline-none"
                    >
                      <option value="all">All Sources</option>
                      {uniqueSources.map((s) => (
                        <option key={s} value={s}>
                          {SOURCE_LABELS[s] || s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      {/* Listings */}
      <div className="mt-5 flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {scoringStatus && (
                <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/[0.04] px-4 py-3">
                  <IconLoader2 size={14} className="shrink-0 animate-spin text-purple-400" />
                  <span className="text-xs text-purple-300">{scoringStatus}</span>
                </div>
              )}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#111118]" />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              {visibleJobs.length === 0 && !loading && (
                <p className="mt-8 text-center text-sm text-slate-500">
                  No jobs match your filters.{" "}
                  {minFitScore > 0 && "Try lowering the minimum fit score."}
                </p>
              )}
              {visibleJobs.map((job, i) => {
                const scored = isScoredJob(job) ? job : null;
                const isSaved = savedJobIds.has(job.id);

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group rounded-2xl border border-white/[0.06] bg-[#111118] p-5 transition-all duration-300 hover:border-purple-500/20 hover:shadow-[0_4px_20px_rgba(124,58,237,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-white">
                            {job.title}
                          </h3>
                          {job.employmentType && (
                            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-400">
                              {job.employmentType.replace(/_/g, " ")}
                            </span>
                          )}
                          <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[11px] text-slate-500">
                            {SOURCE_LABELS[job.source] || job.source}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-light text-slate-500">
                          <span className="flex items-center gap-1">
                            <IconBriefcase size={11} /> {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconMapPin size={11} /> {job.location}
                          </span>
                          {job.salary && (
                            <span className="font-medium text-emerald-400">
                              {job.salary}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <IconCalendar size={11} /> {timeAgo(job.postedAt)}
                          </span>
                        </div>

                        {job.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {job.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[11px] text-slate-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* AI scoring section */}
                        {scored && scored.fitScore > 0 && (
                          <div className="mt-3 space-y-2">
                            {scored.matchedSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {scored.matchedSkills.slice(0, 5).map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-0.5 text-[11px] text-emerald-400"
                                  >
                                    ✓ {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            {scored.missingSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {scored.missingSkills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full border border-rose-500/20 bg-rose-500/[0.04] px-2.5 py-0.5 text-[11px] text-rose-400"
                                  >
                                    ✗ {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            {scored.fitReason && (
                              <p className="text-xs italic text-slate-500">
                                {scored.fitReason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right column: fit score + actions */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {scored && scored.fitScore > 0 && (
                          <div
                            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${fitScoreColor(scored.fitScore)}`}
                          >
                            <IconStar size={11} />
                            {scored.fitScore}%
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleSavedJob(job.id)}
                            title={isSaved ? "Unsave" : "Save job"}
                            className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 text-slate-500 transition-all hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
                          >
                            {isSaved ? (
                              <IconBookmarkFilled size={14} className="text-amber-400" />
                            ) : (
                              <IconBookmark size={14} />
                            )}
                          </button>
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
                          >
                            Apply <IconExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
