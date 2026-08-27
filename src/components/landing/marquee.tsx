"use client";

import { cn } from "@/lib/utils";

const features = [
  "Resume Analysis",
  "AI Proctored Interviews",
  "Placement Drive Management",
  "Cover Letter Generator",
  "Career Coach",
  "Interview Prep",
  "Resume Builder",
  "ATS Optimization",
  "Job Matching",
  "Skill Gap Detection",
  "Campus Analytics",
  "AI Resume Import",
  "Progress Tracking",
  "Admissions Interviews",
  "Student Eligibility Engine",
];

export function Marquee({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-white/[0.04] bg-[#0d0d14] py-4",
        className
      )}
    >
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-32 bg-gradient-to-r from-[#0d0d14] to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-32 bg-gradient-to-l from-[#0d0d14] to-transparent" />

      <div className="flex animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
        {[...features, ...features].map((feature, i) => (
          <span
            key={i}
            className="mx-8 flex items-center gap-3 whitespace-nowrap text-xs font-medium uppercase tracking-[0.15em] text-slate-500"
          >
            <span className="h-1 w-1 rounded-full bg-purple-500/50" />
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}
