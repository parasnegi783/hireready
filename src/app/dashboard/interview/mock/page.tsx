"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconShieldCheck,
  IconMicrophone,
  IconPlayerStop,
  IconPlayerPlay,
  IconArrowRight,
  IconLoader2,
  IconCheck,
  IconX,
  IconEye,
  IconEyeOff,
  IconVolume,
  IconBrain,
  IconTrophy,
  IconAlertTriangle,
  IconRefresh,
  IconArrowLeft,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import type {
  InterviewQuestion,
  InterviewAnswer,
  IntegritySignals,
} from "@/types";
import { speak, stopSpeaking, createSTT } from "@/lib/interview/speech";
import { createFocusMonitor } from "@/lib/interview/proctor/focus";
import { createAudioMonitor } from "@/lib/interview/proctor/audio";
import { createFaceMonitor } from "@/lib/interview/proctor/face";
import { computeIntegrity } from "@/lib/interview/proctor/integrity";

type View = "consent" | "setup" | "live" | "report";

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
}

function scoreBg(score: number) {
  if (score >= 80) return "border-emerald-500/20 bg-emerald-500/10";
  if (score >= 60) return "border-amber-500/20 bg-amber-500/10";
  return "border-rose-500/20 bg-rose-500/10";
}

export default function MockInterviewPage() {
  const [view, setView] = useState<View>("consent");

  // Setup
  const [role, setRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [questionCount, setQuestionCount] = useState(8);
  const [generating, setGenerating] = useState(false);

  // Live
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [currentEval, setCurrentEval] = useState<InterviewAnswer | null>(null);
  const [sttSupported, setSttSupported] = useState(true);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [focusStatus, setFocusStatus] = useState<"good" | "warn">("good");

  // Media
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sttRef = useRef<ReturnType<typeof createSTT> | null>(null);
  const focusRef = useRef<ReturnType<typeof createFocusMonitor> | null>(null);
  const audioRef = useRef<ReturnType<typeof createAudioMonitor> | null>(null);
  const faceRef = useRef<ReturnType<typeof createFaceMonitor> | null>(null);
  const startTimeRef = useRef("");

  // Report
  const [integrity, setIntegrity] = useState<IntegritySignals | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentQuestion = questions[currentIdx];

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllProctoring();
      stopSpeaking();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAllProctoring() {
    focusRef.current?.stop();
    audioRef.current?.stop();
    faceRef.current?.stop();
    sttRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startMediaAndProctoring() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Focus monitor
      focusRef.current = createFocusMonitor();
      focusRef.current.start();

      // Audio monitor
      audioRef.current = createAudioMonitor();
      audioRef.current.start(stream);

      // Face monitor (async load)
      faceRef.current = createFaceMonitor();
      if (videoRef.current) {
        faceRef.current.start(videoRef.current);
      }

      // Check for focus changes periodically
      const focusCheck = setInterval(() => {
        if (!focusRef.current) {
          clearInterval(focusCheck);
          return;
        }
        const count = focusRef.current.getCount();
        setFocusStatus(count > 0 ? "warn" : "good");
      }, 2000);

      return () => clearInterval(focusCheck);
    } catch (e) {
      console.warn("Could not access camera/mic:", e);
    }
  }

  async function handleGenerateQuestions() {
    if (!role.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role.trim(),
          jobDescription: jobDesc.trim() || undefined,
          count: questionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQuestions(data.questions || []);
      setCurrentIdx(0);
      setAnswers([]);
      startTimeRef.current = new Date().toISOString();
      setView("live");

      // Start proctoring after view switch
      setTimeout(() => {
        startMediaAndProctoring();
      }, 500);
    } catch (e) {
      console.error("Failed to generate questions:", e);
    } finally {
      setGenerating(false);
    }
  }

  const speakQuestion = useCallback(async () => {
    if (!currentQuestion) return;
    setSpeaking(true);
    await speak(currentQuestion.question);
    setSpeaking(false);
  }, [currentQuestion]);

  // Speak question when it changes
  useEffect(() => {
    if (view === "live" && currentQuestion) {
      speakQuestion();
    }
  }, [view, currentIdx, currentQuestion, speakQuestion]);

  function startRecording() {
    setTranscript("");
    setTypedAnswer("");
    setCurrentEval(null);
    setRecording(true);

    audioRef.current?.setUserSpeaking(true);

    const stt = createSTT(
      (text, isFinal) => {
        if (isFinal) {
          setTranscript((prev) => (prev ? prev + " " + text : text));
        } else {
          // Show interim results visually
        }
      },
      () => {
        setRecording(false);
        audioRef.current?.setUserSpeaking(false);
      },
      (msg) => {
        setSttSupported(false);
        console.warn(msg);
      },
    );

    sttRef.current = stt;
    stt.start();
  }

  function stopRecording() {
    sttRef.current?.stop();
    setRecording(false);
    audioRef.current?.setUserSpeaking(false);
  }

  async function submitAnswer() {
    if (!currentQuestion) return;

    const answerText = transcript || typedAnswer;
    if (!answerText.trim()) return;

    setEvaluating(true);
    stopSpeaking();

    try {
      const res = await fetch("/api/ai/mock-interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          transcript: answerText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const answer: InterviewAnswer = {
        questionId: currentQuestion.id,
        transcript: answerText.trim(),
        score: data.score || 0,
        feedback: data.feedback || "",
        modelAnswer: data.modelAnswer || "",
        strengths: data.strengths || [],
        improvements: data.improvements || [],
      };

      setCurrentEval(answer);
      setAnswers((prev) => [...prev, answer]);
    } catch (e) {
      console.error("Evaluation failed:", e);
    } finally {
      setEvaluating(false);
    }
  }

  function nextQuestion() {
    setCurrentEval(null);
    setTranscript("");
    setTypedAnswer("");

    if (currentIdx + 1 >= questions.length) {
      finishInterview();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function finishInterview() {
    const faceSignals = faceRef.current?.getSignals() || {
      lookAwayCount: 0,
      lookAwaySeconds: 0,
      multipleFacesEvents: 0,
      noFaceSeconds: 0,
    };
    const tabSwitches = focusRef.current?.getCount() || 0;
    const voiceEvents = audioRef.current?.getEvents() || 0;

    setIntegrity(computeIntegrity(faceSignals, tabSwitches, voiceEvents));
    stopAllProctoring();
    setView("report");
  }

  const overallScore =
    answers.length > 0
      ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length)
      : 0;

  // --- VIEWS ---

  if (view === "consent") {
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-[#111118] p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
              <IconShieldCheck size={24} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                AI Mock <span className="gradient-text">Interview</span>
              </h1>
              <p className="text-sm text-slate-500">
                Voice-based practice with focus monitoring
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-400">
            <p>
              This mock interview uses your <strong className="text-white">camera</strong> and{" "}
              <strong className="text-white">microphone</strong> to give you a
              realistic interview practice experience with focus feedback.
            </p>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
              <p className="flex items-center gap-2 font-medium text-cyan-400">
                <IconShieldCheck size={16} /> Privacy first
              </p>
              <p className="mt-1 text-xs text-slate-500">
                All processing happens on your device — no video or audio is
                recorded, stored, or uploaded. Only numeric focus signals (like
                &quot;looked away 3 times&quot;) are generated.
              </p>
            </div>
            <ul className="ml-4 list-disc space-y-1 text-slate-500">
              <li>AI speaks each question aloud (text-to-speech)</li>
              <li>You answer by voice (speech-to-text) or type</li>
              <li>Each answer is AI-evaluated with score and feedback</li>
              <li>
                Focus signals (tab switches, gaze) are tracked as practice
                indicators
              </li>
            </ul>
          </div>

          <button
            onClick={() => setView("setup")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-500"
          >
            <IconBrain size={18} />
            Start Mock Interview
          </button>
        </motion.div>
      </div>
    );
  }

  if (view === "setup") {
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-[#111118] p-8"
        >
          <h2 className="text-lg font-bold text-white">Interview Setup</h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure your mock interview session
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">
                Target Role *
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Engineer, Data Analyst"
                className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0A0A0F] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500/30"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">
                Job Description{" "}
                <span className="text-slate-600">(optional)</span>
              </label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste a JD for more targeted questions..."
                rows={4}
                className="mt-1 w-full resize-none rounded-xl border border-white/[0.08] bg-[#0A0A0F] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500/30"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">
                Number of Questions
              </label>
              <div className="mt-2 flex gap-2">
                {[5, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                      questionCount === n
                        ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                        : "border-white/[0.08] text-slate-500 hover:border-white/[0.14]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setView("consent")}
              className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400 hover:border-white/[0.14]"
            >
              Back
            </button>
            <button
              onClick={handleGenerateQuestions}
              disabled={!role.trim() || generating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  Generating questions...
                </>
              ) : (
                <>
                  Generate & Start
                  <IconArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === "live" && currentQuestion) {
    const hasAnswer = !!(transcript || typedAnswer).trim();

    return (
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                Question {currentIdx + 1} / {questions.length}
              </span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{
                    width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  focusStatus === "good"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                }`}
              >
                {focusStatus === "good" ? (
                  <IconEye size={12} />
                ) : (
                  <IconEyeOff size={12} />
                )}
                Focus
              </div>
            </div>
          </div>

          {/* Webcam + Question */}
          <div className="mt-4 flex gap-4">
            {/* Webcam */}
            <div className="relative w-36 shrink-0">
              <video
                ref={videoRef}
                muted
                playsInline
                className="h-28 w-36 rounded-xl border border-white/[0.06] bg-black object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              <div className="absolute bottom-1 left-1 rounded-full border border-white/[0.06] bg-black/60 px-1.5 py-0.5 text-[10px] text-slate-400">
                Monitoring on
              </div>
            </div>

            {/* Question card */}
            <div className="flex-1 rounded-2xl border border-white/[0.06] bg-[#111118] p-5">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-400">
                  {currentQuestion.category}
                </span>
                {currentQuestion.difficulty && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      currentQuestion.difficulty === "hard"
                        ? "border-rose-500/20 text-rose-400"
                        : currentQuestion.difficulty === "medium"
                          ? "border-amber-500/20 text-amber-400"
                          : "border-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                )}
                <button
                  onClick={speakQuestion}
                  disabled={speaking}
                  className="ml-auto flex items-center gap-1 rounded-lg border border-white/[0.08] px-2 py-1 text-[11px] text-slate-500 hover:border-white/[0.14] hover:text-slate-400"
                >
                  <IconVolume size={12} />
                  {speaking ? "Speaking..." : "Replay"}
                </button>
              </div>
              <p className="mt-3 text-base font-medium text-white">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Answer section */}
          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#111118] p-5">
            {!currentEval ? (
              <>
                {/* Recording controls */}
                {sttSupported ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {!recording ? (
                        <button
                          onClick={startRecording}
                          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-500"
                        >
                          <IconMicrophone size={16} />
                          Start Recording
                        </button>
                      ) : (
                        <button
                          onClick={stopRecording}
                          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-500"
                        >
                          <IconPlayerStop size={16} />
                          Stop Recording
                        </button>
                      )}
                      {recording && (
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                          <span className="text-xs text-rose-400">
                            Listening...
                          </span>
                        </div>
                      )}
                    </div>
                    {transcript && (
                      <div className="rounded-xl border border-white/[0.06] bg-[#0A0A0F] p-3">
                        <p className="text-xs text-slate-500">
                          Your answer (speech-to-text):
                        </p>
                        <p className="mt-1 text-sm text-white">{transcript}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-amber-400">
                      Speech recognition not available — type your answer:
                    </p>
                    <textarea
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0A0A0F] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500/30"
                    />
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={submitAnswer}
                    disabled={!hasAnswer || evaluating}
                    className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <IconLoader2 size={14} className="animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <IconCheck size={14} />
                        Submit Answer
                      </>
                    )}
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-500 hover:border-white/[0.14]"
                  >
                    Skip
                  </button>
                </div>
              </>
            ) : (
              /* Evaluation result */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold ${scoreBg(currentEval.score)} ${scoreColor(currentEval.score)}`}
                  >
                    {currentEval.score}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Answer Evaluation
                    </p>
                    <p className="text-xs text-slate-500">
                      {currentEval.feedback}
                    </p>
                  </div>
                </div>

                {currentEval.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-emerald-400">
                      Strengths
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {currentEval.strengths.map((s, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-0.5 text-[11px] text-emerald-400"
                        >
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentEval.improvements.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-amber-400">
                      To Improve
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {currentEval.improvements.map((s, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-0.5 text-[11px] text-amber-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentEval.modelAnswer && (
                  <div className="rounded-xl border border-white/[0.06] bg-[#0A0A0F] p-3">
                    <p className="text-xs font-medium text-slate-400">
                      Model Answer
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {currentEval.modelAnswer}
                    </p>
                  </div>
                )}

                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-500"
                >
                  {currentIdx + 1 >= questions.length ? (
                    <>
                      <IconTrophy size={14} />
                      Finish & See Report
                    </>
                  ) : (
                    <>
                      Next Question
                      <IconArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === "report") {
    return (
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111118] p-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border text-2xl font-bold ${scoreBg(overallScore)} ${scoreColor(overallScore)}`}
              >
                {overallScore}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Interview <span className="gradient-text">Report</span>
                </h2>
                <p className="text-sm text-slate-500">
                  {role} — {answers.length} questions answered
                </p>
              </div>
            </div>
          </div>

          {/* Integrity panel */}
          {integrity && (
            <div className="rounded-2xl border border-white/[0.06] bg-[#111118] p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg font-bold ${scoreBg(integrity.integrityScore)} ${scoreColor(integrity.integrityScore)}`}
                >
                  {integrity.integrityScore}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Focus & Integrity Score
                  </p>
                  <p className="text-xs text-slate-500">
                    Practice signals — not judgments
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {integrity.tabSwitchCount > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/[0.06] px-3 py-1 text-xs text-rose-400">
                    <IconAlertTriangle size={12} />
                    Switched tabs {integrity.tabSwitchCount}×
                  </span>
                )}
                {integrity.lookAwayCount > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1 text-xs text-amber-400">
                    <IconEyeOff size={12} />
                    Looked away {integrity.lookAwayCount}×
                  </span>
                )}
                {integrity.multipleFacesEvents > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/[0.06] px-3 py-1 text-xs text-rose-400">
                    <IconAlertTriangle size={12} />
                    Multiple faces {integrity.multipleFacesEvents}×
                  </span>
                )}
                {integrity.noFaceSeconds > 5 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1 text-xs text-amber-400">
                    <IconEyeOff size={12} />
                    No face for {integrity.noFaceSeconds}s
                  </span>
                )}
                {integrity.secondVoiceEvents > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1 text-xs text-amber-400">
                    <IconVolume size={12} />
                    Background voice {integrity.secondVoiceEvents}×
                  </span>
                )}
                {integrity.tabSwitchCount === 0 &&
                  integrity.lookAwayCount === 0 &&
                  integrity.multipleFacesEvents === 0 && (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1 text-xs text-emerald-400">
                      <IconCheck size={12} />
                      Excellent focus maintained
                    </span>
                  )}
              </div>
            </div>
          )}

          {/* Per-question results */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">
              Question Results
            </h3>
            {answers.map((answer, i) => {
              const q = questions.find((q) => q.id === answer.questionId);
              const expanded = expandedQ === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-white/[0.06] bg-[#111118] p-4"
                >
                  <button
                    onClick={() => setExpandedQ(expanded ? null : i)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${scoreBg(answer.score)} ${scoreColor(answer.score)}`}
                    >
                      {answer.score}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">
                        {q?.question || `Question ${i + 1}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {q?.category} · {answer.strengths.length} strengths ·{" "}
                        {answer.improvements.length} improvements
                      </p>
                    </div>
                    {expanded ? (
                      <IconChevronUp size={16} className="text-slate-500" />
                    ) : (
                      <IconChevronDown size={16} className="text-slate-500" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-3 overflow-hidden border-t border-white/[0.06] pt-3"
                      >
                        <div className="rounded-xl bg-[#0A0A0F] p-3">
                          <p className="text-xs text-slate-500">
                            Your answer:
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            {answer.transcript}
                          </p>
                        </div>

                        <p className="text-sm text-slate-400">
                          {answer.feedback}
                        </p>

                        {answer.strengths.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {answer.strengths.map((s, j) => (
                              <span
                                key={j}
                                className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-0.5 text-[11px] text-emerald-400"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {answer.improvements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {answer.improvements.map((s, j) => (
                              <span
                                key={j}
                                className="rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-0.5 text-[11px] text-amber-400"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {answer.modelAnswer && (
                          <div className="rounded-xl border border-white/[0.06] bg-[#0A0A0F] p-3">
                            <p className="text-xs font-medium text-slate-400">
                              Model Answer
                            </p>
                            <p className="mt-1 text-sm text-slate-300">
                              {answer.modelAnswer}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setView("setup");
                setAnswers([]);
                setCurrentIdx(0);
                setIntegrity(null);
              }}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400 hover:border-white/[0.14]"
            >
              <IconRefresh size={14} />
              Try Again
            </button>
            <a
              href="/dashboard/interview"
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400 hover:border-white/[0.14]"
            >
              <IconArrowLeft size={14} />
              Back to Interview Prep
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
