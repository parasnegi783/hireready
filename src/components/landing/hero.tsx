"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Spotlight } from "./spotlight";
import { GradientOrbs } from "./gradient-orbs";
import { Typewriter } from "./typewriter";
import { IconSparkles, IconBuilding } from "@tabler/icons-react";

const stats = [
  { value: "10+", label: "AI-powered career tools" },
  { value: "4 min", label: "average time to full analysis" },
  { value: "3×", label: "more callbacks after improvements" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20 text-center">
      {/* Backgrounds */}
      <div className="bg-dot-grid absolute inset-0" />
      <Spotlight />
      <GradientOrbs />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-300"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
        </span>
        AI Career Platform &middot; For Students &amp; Colleges
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl"
      >
        Get{" "}
        <span className="gradient-text">Hire Ready.</span>
      </motion.h1>

      {/* Rotating Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-4 text-2xl font-light text-slate-400 sm:text-3xl"
      >
        <Typewriter />
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-6 max-w-lg text-base font-light leading-relaxed text-slate-400 sm:text-lg"
      >
        AI resume analysis, interview prep, cover letters, and job matching for
        students. AI proctored placement drives for colleges.
      </motion.p>

      {/* CTAs — dual audience */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href="/login"
          className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 px-8 py-3.5 text-base font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(124,58,237,0.35)]"
        >
          <IconSparkles size={18} />
          Try Free as Student
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            &rarr;
          </span>
        </Link>
        <Link
          href="/login?role=tpo"
          className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-3.5 text-sm font-light text-slate-300 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.04]"
        >
          <IconBuilding size={16} />
          For Colleges &amp; TPOs
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </motion.div>

      {/* Stats Strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-20 flex flex-col items-center gap-6 sm:flex-row sm:gap-0"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              "px-8 py-2 text-center sm:px-12",
              i < stats.length - 1 &&
                "border-b border-white/[0.06] sm:border-b-0 sm:border-r"
            )}
          >
            <span className="gradient-text block text-3xl font-black sm:text-4xl">
              {stat.value}
            </span>
            <span className="mt-1 block text-xs font-light text-slate-500">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <div className="h-10 w-px bg-gradient-to-b from-purple-500/60 to-transparent animate-pulse" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
