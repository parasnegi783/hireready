"use client";

import { motion } from "framer-motion";
import { TiltCard } from "./tilt-card";
import {
  IconTarget,
  IconMessageChatbot,
  IconMicrophone,
  IconBriefcase,
  IconPencil,
  IconMail,
} from "@tabler/icons-react";

const features = [
  {
    icon: IconTarget,
    title: "Resume Match Score",
    desc: "Upload your resume and paste a JD. AI calculates a semantic match score — not just keyword matching. See exactly how well you fit.",
    large: true,
  },
  {
    icon: IconMessageChatbot,
    title: "AI Career Coach",
    desc: "Ask anything about your resume, skills, or career path. Context-aware answers, not generic advice.",
  },
  {
    icon: IconMicrophone,
    title: "Interview Prep",
    desc: "AI-generated questions tailored to your resume and role. Get scored feedback on every answer.",
  },
  {
    icon: IconPencil,
    title: "Resume Builder",
    desc: "Build from scratch or import your existing PDF. AI auto-fills sections and improves every bullet point.",
  },
  {
    icon: IconMail,
    title: "Cover Letter Generator",
    desc: "Upload your resume, paste the JD, and get a tailored cover letter in seconds. Copy or regenerate.",
  },
  {
    icon: IconBriefcase,
    title: "Live Job Board",
    desc: "Real remote jobs matched to your skills. Search by title, role, or technology. Apply directly.",
  },
];

function ScoreDemo() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0A0A0F] p-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", damping: 15, delay: 0.3 }}
          className="gradient-text text-6xl font-black"
        >
          82%
        </motion.div>
        <p className="mt-1 text-xs text-slate-500">match score for this role</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "82%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-500"
          />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["React", "TypeScript", "Node.js", "SQL"].map((s) => (
          <span
            key={s}
            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
          >
            {s}
          </span>
        ))}
        {["Docker", "K8s"].map((s) => (
          <span
            key={s}
            className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-400"
          >
            {s} &times;
          </span>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-purple-400"
          >
            For Individual Job Seekers
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Everything you need.
            <br />
            <span className="gradient-text">Nothing you don&apos;t.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-md text-base font-light text-slate-400"
          >
            Six powerful tools. One platform. From confused applicant to
            confident hire.
          </motion.p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={feature.large ? "md:col-span-2" : ""}
            >
              <TiltCard
                className={
                  feature.large
                    ? "grid gap-8 md:grid-cols-2 md:items-center md:p-8"
                    : "p-6"
                }
              >
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 text-purple-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-slate-400">
                    {feature.desc}
                  </p>
                </div>
                {feature.large && <ScoreDemo />}
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
