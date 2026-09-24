"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, MapPin, Minus, Search, Sparkles } from "lucide-react";
import { CountUp, EASE } from "@/components/system/motion";
import { StageTicks } from "@/components/system/stage-rail";

// Illustrative: a made-up role, scored the way the real card shows it (see
// components/job-match-card.tsx). Nothing here is fetched.
const TICKET = {
  score: 88,
  title: "Senior Frontend Engineer",
  company: "Northwind Labs",
  location: "Remote",
  salary: "$140,000–$170,000",
  reasoning:
    "Five years of React and TypeScript line up with the core stack. Design-system work matches the role's main project. No GraphQL listed.",
  have: ["React", "TypeScript", "Next.js", "Design systems"],
  gaps: ["GraphQL"],
};

const TICKS = 20;

export function HeroTicket() {
  const reduce = useReducedMotion();
  const lit = Math.round((TICKET.score / 100) * TICKS);

  return (
    <figure className="relative">
      <div className="panel overflow-hidden shadow-[0_40px_80px_-24px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          <span>job match</span>
          <span>illustrative</span>
        </div>

        <div className="flex gap-5 p-5">
          <div className="flex flex-col" aria-label={`Fit score ${TICKET.score} out of 100`} role="img">
            <span className="font-mono text-[2.75rem] font-medium leading-none tracking-[-0.04em] text-ink" aria-hidden="true">
              <CountUp value={TICKET.score} duration={1.4} />
              <span className="ml-0.5 align-top text-base text-accent">%</span>
            </span>
            <span className="mt-2 flex gap-[2px]" aria-hidden="true">
              {Array.from({ length: TICKS }).map((_, i) => (
                <motion.span
                  key={i}
                  className={"h-2.5 w-[3px] rounded-[1px] " + (i < lit ? "bg-accent" : "bg-line-strong")}
                  initial={reduce ? false : { opacity: 0.15 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.05, duration: 0.2 }}
                />
              ))}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-2xl leading-[1.1] text-ink">{TICKET.title}</p>
            <p className="mt-1 text-sm text-ink-2">{TICKET.company}</p>
            <p className="mt-2 flex flex-wrap gap-x-3 font-mono text-[11px] text-ink-3">
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} aria-hidden="true" />
                {TICKET.location}
              </span>
              <span>{TICKET.salary}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5">
          <p className="border-l-2 border-accent/60 pl-3 text-[13px] leading-relaxed text-ink-2">{TICKET.reasoning}</p>
          <ul className="flex flex-wrap gap-1.5">
            {[...TICKET.have.map((s) => ({ s, have: true })), ...TICKET.gaps.map((s) => ({ s, have: false }))].map(({ s, have }, i) => (
              <motion.li
                key={s}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.08, duration: 0.4, ease: EASE }}
                className={
                  "inline-flex h-6 items-center gap-1 rounded px-2 font-mono text-[11px] " +
                  (have ? "border border-accent/25 bg-accent/10 text-accent-ink" : "border border-dashed border-line-strong text-ink-3")
                }
              >
                {have ? <Check size={10} aria-hidden="true" /> : <Minus size={10} aria-hidden="true" />}
                {s}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 border-t border-line px-5 py-3">
          <StageTicks reached={-1} className="mr-auto" />
          <span className="btn btn-quiet btn-sm pointer-events-none" aria-hidden="true">
            <Search size={12} />
            Research
          </span>
          <span className="btn btn-primary btn-sm pointer-events-none" aria-hidden="true">
            <Sparkles size={12} />
            Tailor resume
          </span>
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-ink-3">
        A made-up role, laid out the way a real match arrives: the score, the model&apos;s reasoning, and which skills you have or lack.
      </figcaption>
    </figure>
  );
}
