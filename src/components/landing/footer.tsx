"use client";

import Link from "next/link";
import { IconSparkles, IconBrandGithub, IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";

const productLinks = [
  { label: "Resume Analyzer", href: "/login" },
  { label: "AI Coach", href: "/login" },
  { label: "Interview Prep", href: "/login" },
  { label: "Pricing", href: "#pricing" },
];

const legalLinks: { label: string; href: string }[] = [];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#080810] px-6 pt-14 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 border-b border-white/[0.04] pb-10 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500">
                <IconSparkles size={14} className="text-white" />
              </div>
              <span className="text-base font-semibold text-white/80">
                HireReady
              </span>
            </Link>
            <p className="mt-3 text-sm font-light leading-relaxed text-slate-500">
              AI-powered career coaching for the next generation of engineers and
              professionals.
            </p>
            <div className="mt-4 flex gap-3">
              {[IconBrandGithub, IconBrandLinkedin, IconBrandX].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-slate-500 transition-all hover:border-white/[0.12] hover:text-white"
                  >
                    <Icon size={15} />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h5 className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                Product
              </h5>
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="mb-2.5 block text-sm font-light text-slate-500 transition-colors hover:text-amber-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <h5 className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                Legal
              </h5>
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="mb-2.5 block text-sm font-light text-slate-500 transition-colors hover:text-amber-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-light text-slate-600">
            &copy; {new Date().getFullYear()} HireReady. All rights reserved.
          </p>
          <p className="font-serif text-xs font-light italic text-purple-500/40">
            Get Hire Ready. Land the offer.
          </p>
        </div>
      </div>
    </footer>
  );
}
