"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import {
  IconUpload,
  IconFileText,
  IconSparkles,
  IconX,
  IconLoader2,
  IconCheck,
  IconAlertTriangle,
  IconMessageChatbot,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";

interface AnalysisResult {
  matchScore: number;
  atsScore: number;
  skillsPresent: string[];
  skillsMissing: string[];
  suggestions: {
    title: string;
    description: string;
    priority: "critical" | "important" | "nice-to-have";
  }[];
  sectionFeedback: {
    section: string;
    score: number;
    feedback: string;
  }[];
}

export default function AnalyzePage() {
  const { user } = useAuthStore();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setResumeFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) return;
    setAnalyzing(true);
    setError("");

    try {
      // Step 1: Parse PDF
      const formData = new FormData();
      formData.append("file", resumeFile);

      const parseRes = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!parseRes.ok) throw new Error("Failed to parse resume PDF");
      const { text: resumeText } = await parseRes.json();

      if (!resumeText || resumeText.trim().length < 50) {
        throw new Error("Could not extract enough text from your resume. Try a different PDF.");
      }

      // Step 2: Analyze with AI
      const analyzeRes = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!analyzeRes.ok) throw new Error("AI analysis failed. Please try again.");
      const analysis = await analyzeRes.json();

      if (analysis.error) throw new Error(analysis.error);

      const skills: string[] = analysis.skillsPresent || [];
      setResult({
        matchScore: analysis.matchScore || 0,
        atsScore: analysis.atsScore || 0,
        skillsPresent: skills,
        skillsMissing: analysis.skillsMissing || [],
        suggestions: analysis.suggestions || [],
        sectionFeedback: analysis.sectionFeedback || [],
      });
      // Persist skills and resume text so Job Board can use them
      if (skills.length) {
        localStorage.setItem("hireready_skills", JSON.stringify(skills));
      }
      localStorage.setItem("hireready_resume", resumeText);
      // Save to Supabase
      if (user?.id) {
        supabase.from("analyses").insert({
          user_id: user.id,
          job_description: jobDescription.substring(0, 2000),
          match_score: analysis.matchScore || 0,
          ats_score: analysis.atsScore || 0,
          skills_present: skills,
          skills_missing: analysis.skillsMissing || [],
          suggestions: analysis.suggestions || [],
          section_feedback: analysis.sectionFeedback || [],
        }).then(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-emerald-500 to-cyan-500";
    if (score >= 40) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-red-500";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "critical") return "border-rose-500/20 bg-rose-500/10 text-rose-400";
    if (priority === "important") return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  };

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Resume <span className="gradient-text">Analyzer</span>
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          Upload your resume and paste a job description to get your match score.
        </p>
      </motion.div>

      {!result ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Resume Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-3 text-sm font-medium text-slate-300">
              1. Upload Your Resume
            </h3>
            <div
              {...getRootProps()}
              className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                isDragActive
                  ? "border-purple-500/50 bg-purple-500/5"
                  : resumeFile
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/[0.08] hover:border-purple-500/30 hover:bg-white/[0.01]"
              }`}
            >
              <input {...getInputProps()} />
              {resumeFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <IconFileText size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeFile(null);
                    }}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:underline"
                  >
                    <IconX size={12} /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <IconUpload size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">
                      Drop your resume here or{" "}
                      <span className="text-purple-400">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">PDF only</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Job Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-3 text-sm font-medium text-slate-300">
              2. Paste the Job Description
            </h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description from LinkedIn, Naukri, or any job board..."
              className="min-h-[200px] w-full resize-none rounded-2xl border border-white/[0.08] bg-[#111118] p-5 text-sm font-light text-white outline-none transition-all placeholder:text-slate-600 focus:border-purple-500/30"
            />
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-3 text-sm text-rose-400"
            >
              {error}
            </motion.div>
          )}

          {/* Analyze Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <button
              onClick={handleAnalyze}
              disabled={!resumeFile || !jobDescription.trim() || analyzing}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-4 text-base font-medium text-white transition-all hover:scale-[1.01] hover:shadow-[0_8px_32px_rgba(124,58,237,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  Analyzing your resume...
                </>
              ) : (
                <>
                  <IconSparkles size={18} />
                  Analyze Resume
                </>
              )}
            </button>
          </motion.div>
        </div>
      ) : (
        /* Results */
        <div className="mt-8 space-y-6">
          {/* Score Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Match Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#111118] p-8"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                Match Score
              </p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className={`mt-4 text-7xl font-black ${getScoreColor(result.matchScore)}`}
              >
                {result.matchScore}%
              </motion.div>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.matchScore}%` }}
                  transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(result.matchScore)}`}
                />
              </div>
            </motion.div>

            {/* ATS Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#111118] p-8"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                ATS Compatibility
              </p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.3 }}
                className={`mt-4 text-7xl font-black ${getScoreColor(result.atsScore)}`}
              >
                {result.atsScore}%
              </motion.div>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.atsScore}%` }}
                  transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(result.atsScore)}`}
                />
              </div>
            </motion.div>
          </div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/[0.06] bg-[#111118] p-6"
          >
            <h3 className="mb-4 text-base font-semibold">Skills Analysis</h3>
            <div className="flex flex-wrap gap-2">
              {result.skillsPresent.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400"
                >
                  <IconCheck size={12} /> {s}
                </span>
              ))}
              {result.skillsMissing.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400"
                >
                  <IconX size={12} /> {s}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Section Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/[0.06] bg-[#111118] p-6"
          >
            <h3 className="mb-4 text-base font-semibold">Section Feedback</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {result.sectionFeedback.map((sf, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {sf.section}
                    </span>
                    <span className={`text-sm font-bold ${getScoreColor(sf.score)}`}>
                      {sf.score}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sf.score}%` }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(sf.score)}`}
                    />
                  </div>
                  <p className="mt-2 text-xs font-light text-slate-500">
                    {sf.feedback}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/[0.06] bg-[#111118] p-6"
          >
            <h3 className="mb-4 text-base font-semibold">
              AI Suggestions
            </h3>
            <div className="flex flex-col gap-3">
              {result.suggestions.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {s.priority === "critical" ? (
                        <IconAlertTriangle size={16} className="text-rose-400" />
                      ) : (
                        <IconSparkles size={16} className="text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white">
                          {s.title}
                        </h4>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getPriorityColor(s.priority)}`}
                        >
                          {s.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-light text-slate-500">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setResult(null);
                setResumeFile(null);
                setJobDescription("");
              }}
              className="rounded-full border border-white/[0.08] px-6 py-2.5 text-sm font-light text-slate-300 transition-all hover:bg-white/[0.04]"
            >
              New Analysis
            </button>
            <Link
              href="/dashboard/coach"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)]"
            >
              <IconMessageChatbot size={16} />
              Ask AI Coach
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
