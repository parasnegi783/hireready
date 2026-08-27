"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for getting started",
    features: [
      "5 resume analyses per week",
      "AI match scoring + ATS check",
      "AI improvement suggestions",
      "Basic AI coach chat",
      "2 interview prep sessions/week",
      "Live job board",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/month",
    desc: "For serious job seekers",
    features: [
      "Unlimited resume analyses",
      "Unlimited interview prep + AI feedback",
      "Full AI career coach (context memory)",
      "Resume builder + AI import + PDF export",
      "Cover letter generator",
      "Job board with smart matching",
      "Progress tracking with charts",
      "Cancel anytime",
    ],
    cta: "Start Pro — ₹299/mo",
    highlight: true,
  },
  {
    name: "Campus",
    price: "₹50K",
    period: "/year",
    desc: "For colleges & placement cells",
    features: [
      "Placement drive management",
      "Student eligibility engine",
      "Application pipeline (Kanban)",
      "AI proctored interviews",
      "Per-student report cards",
      "Placement analytics dashboard",
      "All students get Pro access",
      "Admissions interviews (Enterprise)",
    ],
    cta: "Set Up Your College",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 bg-[#0d0d14]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-purple-400"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-md text-base font-light text-slate-400"
          >
            Start free. Upgrade when you&apos;re ready to go all-in.
          </motion.p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative overflow-hidden rounded-2xl border p-7 transition-all duration-300 ${
                plan.highlight
                  ? "border-purple-500/30 bg-[#111118] shadow-[0_0_60px_rgba(124,58,237,0.1)]"
                  : "border-white/[0.06] bg-[#111118]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500" />
              )}
              {plan.highlight && (
                <span className="mb-4 inline-block rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm font-light text-slate-500">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-light text-slate-400">
                {plan.desc}
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {plan.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2.5 text-sm font-light text-slate-300"
                  >
                    <IconCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-medium transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)]"
                    : "border border-white/[0.08] text-slate-300 hover:border-white/[0.15] hover:bg-white/[0.04]"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
