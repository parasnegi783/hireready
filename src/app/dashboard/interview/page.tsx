"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  IconMicrophone,
  IconSparkles,
  IconBrain,
  IconUsers,
  IconCode,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconCheck,
  IconLoader2,
  IconRefresh,
  IconTrophy,
  IconUpload,
  IconFileText,
  IconX,
} from "@tabler/icons-react";

interface Question {
  question: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
}

type View = "setup" | "loading" | "quiz" | "done";

const categories = [
  { id: "all", icon: IconMicrophone, label: "Mock Interview", desc: "All types mixed", color: "from-purple-600 to-cyan-500" },
  { id: "technical", icon: IconCode, label: "Technical", desc: "Coding & system design", color: "from-purple-600 to-purple-400" },
  { id: "behavioral", icon: IconBrain, label: "Behavioral", desc: "STAR-method questions", color: "from-cyan-600 to-cyan-400" },
  { id: "hr", icon: IconUsers, label: "HR / Culture", desc: "Fit & motivation", color: "from-emerald-600 to-emerald-400" },
];

const difficultyColor: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function InterviewPage() {
  const [view, setView] = useState<View>("setup");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setResumeFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState("");
  const [scores, setScores] = useState<number[]>([]);

  const currentQuestion = questions[currentIndex];

  async function generateQuestions() {
    if (!resumeFile || !jobDescription.trim()) {
      setError("Please upload your resume and paste the job description.");
      return;
    }
    setError("");
    setView("loading");

    try {
      // Parse PDF first
      const formData = new FormData();
      formData.append("file", resumeFile);
      const parseRes = await fetch("/api/resume/parse", { method: "POST", body: formData });
      if (!parseRes.ok) throw new Error("Failed to parse resume PDF");
      const { text: resumeText } = await parseRes.json();
      if (!resumeText || resumeText.trim().length < 50)
        throw new Error("Could not extract enough text from your resume. Try a different PDF.");

      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          resumeText,
          jobDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions");

      // Flatten based on selected category
      let flat: Question[] = [];
      if (selectedCategory === "all" || selectedCategory === "technical") {
        flat = flat.concat((data.technical || []).map((q: Omit<Question, "category">) => ({ ...q, category: "Technical" })));
      }
      if (selectedCategory === "all" || selectedCategory === "behavioral") {
        flat = flat.concat((data.behavioral || []).map((q: Omit<Question, "category">) => ({ ...q, category: "Behavioral" })));
      }
      if (selectedCategory === "all" || selectedCategory === "hr") {
        flat = flat.concat((data.hr || []).map((q: Omit<Question, "category">) => ({ ...q, category: "HR" })));
      }

      if (flat.length === 0) {
        throw new Error("AI didn't return any questions. Try a different job description.");
      }
      setQuestions(flat);
      setCurrentIndex(0);
      setScores([]);
      setAnswer("");
      setEvaluation(null);
      setShowHint(false);
      setView("quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setView("setup");
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setEvaluating(true);
    setEvaluation(null);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          question: currentQuestion.question,
          answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate");
      setEvaluation(data);
      setScores((prev) => [...prev, data.score ?? 0]);
    } catch {
      setEvaluation({
        score: 0,
        strengths: [],
        improvements: ["Could not evaluate answer. Please try again."],
        sampleAnswer: "",
      });
    } finally {
      setEvaluating(false);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      setView("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setEvaluation(null);
      setShowHint(false);
    }
  }

  function restart() {
    setView("setup");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer("");
    setEvaluation(null);
    setScores([]);
    setError("");
    setResumeFile(null);
  }

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Interview <span className="gradient-text">Prep</span>
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          AI-generated questions tailored to your role. Get real-time feedback on every answer.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── SETUP VIEW ── */}
        {view === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mt-8"
          >
            {/* Category picker */}
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
              Choose focus
            </p>
            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative flex flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? "border-purple-500/40 bg-purple-500/[0.07]"
                      : "border-white/[0.06] bg-[#111118] hover:border-white/[0.12]"
                  }`}
                >
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white`}>
                    <cat.icon size={16} />
                  </div>
                  <p className="text-sm font-semibold text-white">{cat.label}</p>
                  <p className="mt-0.5 text-xs font-light text-slate-500">{cat.desc}</p>
                  {selectedCategory === cat.id && (
                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
                      <IconCheck size={11} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4">
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
                        : "border-white/[0.08] bg-[#111118] hover:border-purple-500/30 hover:bg-purple-500/[0.03]"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <IconUpload size={22} className="mb-2 text-slate-500" />
                    <p className="text-sm font-medium text-white">
                      {isDragActive ? "Drop it here" : "Drop PDF or click to upload"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">PDF only</p>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={5}
                  placeholder="Paste the job description here..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#111118] px-4 py-3 text-sm font-light text-white outline-none transition-all placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-rose-400">{error}</p>
            )}

            <button
              onClick={generateQuestions}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)]"
            >
              <IconSparkles size={16} />
              Generate Questions
            </button>
          </motion.div>
        )}

        {/* ── LOADING VIEW ── */}
        {view === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-24 flex flex-col items-center gap-4 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
              <IconLoader2 size={28} className="animate-spin text-purple-400" />
            </div>
            <p className="text-base font-semibold text-white">Generating your questions...</p>
            <p className="text-sm font-light text-slate-500">
              AI is tailoring questions to your resume and role
            </p>
          </motion.div>
        )}

        {/* ── QUIZ VIEW ── */}
        {view === "quiz" && currentQuestion && (
          <motion.div
            key={`quiz-${currentIndex}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="mt-8"
          >
            {/* Progress */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-white/[0.08] bg-[#111118] px-2.5 py-1 text-xs font-medium text-slate-400">
                  {currentQuestion.category}
                </span>
                <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${difficultyColor[currentQuestion.difficulty]}`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <span className="text-xs font-light text-slate-500">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Question */}
            <div className="mb-4 rounded-2xl border border-white/[0.06] bg-[#111118] p-6">
              <p className="text-lg font-semibold leading-relaxed text-white">
                {currentQuestion.question}
              </p>

              {/* Hint toggle */}
              <button
                onClick={() => setShowHint(!showHint)}
                className="mt-4 flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300"
              >
                {showHint ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                Interviewer hint
              </button>
              <AnimatePresence>
                {showHint && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden text-sm font-light text-slate-400"
                  >
                    💡 {currentQuestion.hint}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Answer area — hide after evaluation */}
            {!evaluation && (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  placeholder="Type your answer here..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#111118] px-4 py-3 text-sm font-light text-white outline-none transition-all placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10"
                />
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || evaluating}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {evaluating ? (
                    <><IconLoader2 size={16} className="animate-spin" /> Evaluating...</>
                  ) : (
                    <>Submit Answer <IconArrowRight size={16} /></>
                  )}
                </button>
              </>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {evaluation && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex flex-col gap-4"
                >
                  {/* Score */}
                  <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111118] p-5">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                      <svg className="absolute h-16 w-16 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                        <circle
                          cx="28" cy="28" r="24"
                          fill="none"
                          stroke={evaluation.score >= 75 ? "#10B981" : evaluation.score >= 50 ? "#F59E0B" : "#F43F5E"}
                          strokeWidth="5"
                          strokeDasharray={`${(evaluation.score / 100) * 150.8} 150.8`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-lg font-black text-white">{evaluation.score}</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        {evaluation.score >= 75 ? "Great answer!" : evaluation.score >= 50 ? "Good start" : "Needs work"}
                      </p>
                      <p className="text-xs font-light text-slate-500">AI evaluation score</p>
                    </div>
                  </div>

                  {/* Strengths */}
                  {evaluation.strengths.length > 0 && (
                    <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                        Strengths
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {evaluation.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm font-light text-slate-300">
                            <IconCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {evaluation.improvements.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.04] p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
                        Improve
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {evaluation.improvements.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm font-light text-slate-300">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sample answer */}
                  {evaluation.sampleAnswer && (
                    <div className="rounded-2xl border border-purple-500/10 bg-purple-500/[0.04] p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
                        Sample Answer
                      </p>
                      <p className="text-sm font-light leading-relaxed text-slate-300">
                        {evaluation.sampleAnswer}
                      </p>
                    </div>
                  )}

                  {/* Next */}
                  <button
                    onClick={nextQuestion}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)]"
                  >
                    {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
                    <IconArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── DONE VIEW ── */}
        {view === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 flex flex-col items-center text-center"
          >
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500">
              <IconTrophy size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Session Complete!</h2>
            <p className="mt-2 text-sm font-light text-slate-500">
              You answered {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>

            {/* Avg score */}
            <div className="mt-8 flex items-center gap-6">
              <div className="rounded-2xl border border-white/[0.06] bg-[#111118] px-8 py-5 text-center">
                <p className="text-4xl font-black text-white">{avgScore}</p>
                <p className="mt-1 text-xs font-light text-slate-500">Average score</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-[#111118] px-8 py-5 text-center">
                <p className="text-4xl font-black text-white">{questions.length}</p>
                <p className="mt-1 text-xs font-light text-slate-500">Questions done</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={restart}
                className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:border-white/[0.15]"
              >
                <IconRefresh size={16} />
                Try Again
              </button>
              <button
                onClick={() => { setSelectedCategory("all"); restart(); }}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 text-sm font-medium text-white transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.3)]"
              >
                <IconSparkles size={16} />
                New Session
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
