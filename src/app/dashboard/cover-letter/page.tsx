"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  IconSparkles,
  IconUpload,
  IconFileText,
  IconX,
  IconLoader2,
  IconCopy,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";

export default function CoverLetterPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setResumeFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  async function generate() {
    if (!resumeFile || !jobDescription.trim()) {
      setError("Please upload your resume and paste the job description.");
      return;
    }
    setError("");
    setLoading(true);
    setCoverLetter("");

    try {
      // Parse PDF
      const formData = new FormData();
      formData.append("file", resumeFile);
      const parseRes = await fetch("/api/resume/parse", { method: "POST", body: formData });
      if (!parseRes.ok) throw new Error("Failed to parse resume");
      const { text: resumeText } = await parseRes.json();
      if (!resumeText || resumeText.trim().length < 50)
        throw new Error("Could not extract text from resume.");

      // Generate cover letter
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, company: company || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setCoverLetter(data.coverLetter || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Cover Letter <span className="gradient-text">Generator</span>
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          Upload your resume and paste a JD — AI writes a tailored cover letter.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!coverLetter ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mt-8 flex flex-col gap-5"
          >
            {/* Resume upload */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Your Resume <span className="text-slate-600">(PDF)</span>
              </label>
              {resumeFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3">
                  <IconFileText size={18} className="shrink-0 text-emerald-400" />
                  <span className="flex-1 truncate text-sm text-white">{resumeFile.name}</span>
                  <button onClick={() => setResumeFile(null)} className="text-slate-500 hover:text-white">
                    <IconX size={16} />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-all ${
                    isDragActive
                      ? "border-purple-500/60 bg-purple-500/[0.06]"
                      : "border-white/[0.08] bg-[#111118] hover:border-purple-500/30"
                  }`}
                >
                  <input {...getInputProps()} />
                  <IconUpload size={22} className="mb-2 text-slate-500" />
                  <p className="text-sm font-medium text-white">
                    {isDragActive ? "Drop it here" : "Drop PDF or click to upload"}
                  </p>
                </div>
              )}
            </div>

            {/* Company name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Company Name <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Flipkart, etc."
                className="w-full rounded-xl border border-white/[0.08] bg-[#111118] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500/50"
              />
            </div>

            {/* Job description */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder="Paste the job description here..."
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#111118] px-4 py-3 text-sm font-light text-white outline-none placeholder:text-slate-600 focus:border-purple-500/50"
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              onClick={generate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <><IconLoader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><IconSparkles size={16} /> Generate Cover Letter</>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mt-8"
          >
            {/* Cover letter output */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#111118] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-purple-400">Your Cover Letter</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-white/[0.08]"
                >
                  {copied ? (
                    <><IconCheck size={13} className="text-emerald-400" /> Copied!</>
                  ) : (
                    <><IconCopy size={13} /> Copy</>
                  )}
                </button>
              </div>
              <div className="whitespace-pre-wrap text-sm font-light leading-relaxed text-slate-300">
                {coverLetter}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setCoverLetter(""); setError(""); }}
                className="flex items-center gap-2 rounded-full border border-white/[0.08] px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.04]"
              >
                <IconRefresh size={16} />
                New Letter
              </button>
              <button
                onClick={generate}
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 text-sm font-medium text-white transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
              >
                {loading ? <IconLoader2 size={16} className="animate-spin" /> : <IconSparkles size={16} />}
                Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
