"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Sign in",
    detail: "Email or a social account. No setup wizard, no onboarding call.",
  },
  {
    title: "Fill in your profile",
    detail: "Skills, job titles, salary range and work type, plus a base resume as PDF, DOC or DOCX.",
  },
  {
    title: "Find matches",
    detail:
      "Match scores the latest scraped roles against your profile with an LLM and keeps the ones worth your time, each with its reasoning and skill gaps.",
  },
  {
    title: "Apply with a tailored resume",
    detail:
      "One click rewrites your resume for that posting while keeping your layout, then tracks the application from Applied to Offer.",
  },
  {
    title: "Walk in prepared",
    detail:
      "A company research brief and an interview prep guide: role analysis, likely questions, STAR scaffolds, questions to ask.",
  },
] as const;

/**
 * The loop as a scroll-driven rail: the amber line fills as you read, and
 * the step at the centre of the viewport lights up. Nothing auto-plays.
 */
export function Loop() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <ol ref={ref} className="relative">
      <span aria-hidden="true" className="absolute bottom-3 left-[11px] top-3 w-px bg-line" />
      <motion.span
        aria-hidden="true"
        className="absolute bottom-3 left-[11px] top-3 w-px origin-top bg-accent"
        style={{ scaleY: fill }}
      />
      {STEPS.map((step, i) => (
        <Step key={step.title} index={i} {...step} />
      ))}
    </ol>
  );
}

function Step({ index, title, detail }: { index: number; title: string; detail: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { margin: "-42% 0px -42% 0px" });
  const passed = useInView(ref, { margin: "0px 0px -58% 0px" });

  return (
    <li ref={ref} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-6 pb-14 last:pb-0">
      <span
        aria-hidden="true"
        className={cn(
          "relative mt-1.5 grid size-6 place-items-center rounded-full border bg-bg font-mono text-[10px] transition-colors duration-500",
          on || passed ? "border-accent text-accent" : "border-line-strong text-ink-3",
        )}
      >
        {index + 1}
      </span>
      <div className={cn("transition-opacity duration-500", on ? "opacity-100" : "opacity-45")}>
        <h3 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] text-ink">{title}</h3>
        <p className="mt-3 max-w-[52ch] leading-relaxed text-ink-2">{detail}</p>
      </div>
    </li>
  );
}
