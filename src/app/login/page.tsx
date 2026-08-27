"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  IconSparkles,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
  IconTarget,
  IconMessageChatbot,
  IconBook,
  IconMail,
} from "@tabler/icons-react";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPassword,
} from "@/lib/supabase";

const features = [
  {
    icon: IconTarget,
    title: "Resume Analyzer",
    desc: "AI-powered match scoring & gap detection",
  },
  {
    icon: IconMessageChatbot,
    title: "AI Career Coach",
    desc: "Ask anything about your resume",
  },
  {
    icon: IconBook,
    title: "Interview Prep",
    desc: "Mock interviews with AI feedback",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [role, setRole] = useState<"student" | "tpo">("student");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "signin") {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } else {
      if (!name.trim()) {
        setError("Please enter your full name.");
        setLoading(false);
        return;
      }
      const { data, error } = await signUpWithEmail(email, password, name, role);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (!data.session) {
        // Email confirmation required
        setLoading(false);
        setConfirmSent(true);
      } else {
        router.push("/dashboard");
      }
    }
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email above first, then click Forgot password.");
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-[#0d0d14] p-12 lg:flex">
        {/* Orbs */}
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Brand */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500">
            <IconSparkles size={16} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white">HireReady</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
          </span>
        </Link>

        {/* Main content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
            Your next offer
            <br />
            <span className="gradient-text italic">starts here.</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-slate-500">
            Upload your resume, paste a job description, and let HireReady tell
            you exactly what&apos;s missing — and how to fix it.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="group flex items-center gap-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition-all duration-300 hover:border-purple-500/20 hover:bg-purple-500/[0.04]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]">
                  <f.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>
                  <p className="text-xs font-light text-slate-500">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 font-serif text-sm italic text-purple-500/40">
          Get Hire Ready. Land the offer.
        </p>
      </div>

      {/* Right Panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto bg-[#0A0A0F] px-8 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white"
        >
          <IconArrowLeft size={16} />
          Back
        </Link>

        {/* Confirm email screen */}
        {confirmSent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
              <IconMail size={28} className="text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Check your inbox</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-slate-400">
              We sent a confirmation link to{" "}
              <span className="font-medium text-white">{email}</span>.<br />
              Click it to activate your account, then sign in.
            </p>
            <button
              onClick={() => {
                setConfirmSent(false);
                setMode("signin");
              }}
              className="mt-8 w-full rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)]"
            >
              Back to sign in →
            </button>
          </motion.div>
        )}

        {!confirmSent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="mb-8">
            <p className="mb-2.5 flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.15em] text-purple-400">
              <span className="h-px w-6 bg-purple-400" />
              Welcome
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              {mode === "signin" ? "Sign in to" : "Create your"}
              <br />
              <span className="gradient-text">
                {mode === "signin" ? "HireReady" : "account"}
              </span>
            </h2>
            <p className="mt-2 text-sm font-light text-slate-500">
              {mode === "signin" ? (
                <>
                  New here?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="font-medium text-purple-400 hover:underline"
                  >
                    Create a free account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="font-medium text-purple-400 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            {(["signin", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`flex-1 rounded-lg py-2 text-sm transition-all ${
                  mode === tab
                    ? "bg-white/[0.06] font-medium text-white shadow-sm"
                    : "font-light text-slate-500"
                }`}
              >
                {tab === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {/* Error / Reset success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400"
              >
                {error}
              </motion.div>
            )}
            {resetSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400"
              >
                Password reset email sent — check your inbox.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] py-3 text-sm font-medium text-slate-200 transition-all hover:border-white/[0.15] hover:bg-white/[0.04]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="mb-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs font-light text-slate-600">
              or continue with email
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Signup-only fields */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex flex-col gap-4"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Full name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0F] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      I am a
                    </label>
                    <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
                      {([
                        { value: "student" as const, label: "Student / Job Seeker" },
                        { value: "tpo" as const, label: "Placement Officer" },
                      ]).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRole(opt.value)}
                          className={`flex-1 rounded-lg py-2 text-xs transition-all ${
                            role === opt.value
                              ? "bg-white/[0.06] font-medium text-white shadow-sm"
                              : "font-light text-slate-500"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0F] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0A0A0F] px-4 py-3 pr-10 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? (
                    <IconEyeOff size={16} />
                  ) : (
                    <IconEye size={16} />
                  )}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="-mt-1 mb-4 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-purple-400 hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? mode === "signin"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signin"
                  ? "Sign in to HireReady →"
                  : "Create account →"}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] font-light leading-relaxed text-slate-600">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
        )}
      </div>
    </div>
  );
}
