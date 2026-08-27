"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUpload,
  IconClipboardText,
  IconRocket,
  IconBuildingBank,
  IconUsersGroup,
  IconShieldCheck,
} from "@tabler/icons-react";

const studentSteps = [
  {
    icon: IconUpload,
    title: "Upload your resume",
    desc: "Drag and drop your PDF. HireReady reads and understands every section in seconds.",
  },
  {
    icon: IconClipboardText,
    title: "Paste the job description",
    desc: "Copy the JD from LinkedIn, Naukri, or anywhere. Paste it in. That's it.",
  },
  {
    icon: IconRocket,
    title: "Get your path to hire",
    desc: "Instant match score, missing skills, AI suggestions, interview prep, cover letter — all in one place.",
  },
];

const collegeSteps = [
  {
    icon: IconBuildingBank,
    title: "Create a placement drive",
    desc: "Add the company, role, JD, and eligibility criteria (CGPA, branch, batch year). Eligible students see it automatically.",
  },
  {
    icon: IconUsersGroup,
    title: "Students apply & prepare",
    desc: "Students apply with one click and use HireReady's AI tools to prep. You see the pipeline in real time.",
  },
  {
    icon: IconShieldCheck,
    title: "AI interviews + shortlist",
    desc: "Run AI-proctored interviews at scale. Get per-student report cards with scores, proctoring flags, and AI recommendations.",
  },
];

export function HowItWorks() {
  const [tab, setTab] = useState<"student" | "college">("student");
  const steps = tab === "student" ? studentSteps : collegeSteps;

  return (
    <section id="how-it-works" className="relative py-32 bg-[#0d0d14]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-purple-400"
          >
            Simple by design
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Three steps to{" "}
            <span className="gradient-text">clarity</span>
          </motion.h2>

          {/* Tab toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 inline-flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1"
          >
            {(["student", "college"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-6 py-2 text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "student" ? "For Students" : "For Colleges"}
              </button>
            ))}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid gap-12 md:grid-cols-3 md:gap-8"
          >
            {/* Connector line */}
            <div className="pointer-events-none absolute top-10 left-[16.67%] right-[16.67%] hidden h-px md:block">
              <div className="h-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-emerald-500/20" />
              <motion.div
                className="absolute top-[-3px] h-[7px] w-[7px] rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="group text-center"
              >
                <div className="relative z-10 mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.08] bg-[#111118] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-5deg] group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-cyan-500 group-hover:shadow-[0_8px_32px_rgba(124,58,237,0.3)]">
                  <step.icon size={28} className="text-purple-400 transition-colors duration-300 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
