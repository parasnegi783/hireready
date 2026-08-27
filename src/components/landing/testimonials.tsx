"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    text: "I ran my resume through HireReady before a Flipkart application. It told me I was missing 'system design' framing. I rewrote two bullet points. Got the interview.",
    name: "Arjun K.",
    role: "CSE, 3rd year · Delhi",
    initials: "AK",
    gradient: "from-purple-600 to-cyan-500",
  },
  {
    text: "The AI coach is what got me. I asked why my summary was weak and it rewrote it with specific suggestions. That conversation changed how I think about resumes.",
    name: "Sneha M.",
    role: "Final year · Pune",
    initials: "SM",
    gradient: "from-cyan-500 to-emerald-500",
  },
  {
    text: "I went from a 41% match to 84% on the same job listing in 2 hours. Just followed the suggestions. Two days later I had a screening call booked.",
    name: "Rohan V.",
    role: "ECE graduate · Bangalore",
    initials: "RV",
    gradient: "from-amber-500 to-purple-600",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-purple-400"
          >
            Early Users
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            They found their{" "}
            <span className="gradient-text">path.</span>
          </motion.h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111118] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(124,58,237,0.08)]"
            >
              {/* Background quote mark */}
              <span className="pointer-events-none absolute -bottom-4 right-3 select-none font-serif text-[8rem] font-black leading-none text-white/[0.03]">
                &rdquo;
              </span>

              {/* Stars */}
              <div className="mb-5 text-sm tracking-widest text-amber-400">
                ★★★★★
              </div>

              <p className="relative z-10 font-serif text-base leading-relaxed text-white/90 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-medium text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs font-light text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
