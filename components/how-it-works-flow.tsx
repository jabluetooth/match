"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    id: "account",
    label: "Create your account",
    detail: "Sign in with email or a social account — no forms, no setup wizard.",
    seconds: 0.4,
  },
  {
    id: "profile",
    label: "Complete your profile",
    detail: "Add your skills, job titles, salary and work-type preferences, and drop in a base resume (PDF, DOC, or DOCX).",
    seconds: 1.2,
  },
  {
    id: "matches",
    label: "Find your first matches",
    detail: "Match scores open roles against your profile with an LLM and surfaces the ones actually worth applying to.",
    seconds: 3.8,
  },
  {
    id: "resume",
    label: "Apply with a tailored resume",
    detail: "Generate a version of your resume rewritten for that specific posting, preserving your original layout, and track the application from Applied through Offer.",
    seconds: 6.5,
  },
  {
    id: "interview",
    label: "Prep and land the interview",
    detail: "Get a company research brief and an interview-prep sheet — role analysis, likely questions, STAR scaffolds — before you walk in.",
    seconds: 9.1,
  },
] as const;

type Status = "pending" | "active" | "done";

const POP = { type: "spring", stiffness: 640, damping: 22, mass: 0.7 } as const;
const STILL = { duration: 0 } as const;
const EASE = [0.16, 1, 0.3, 1] as const;
const STEP_DELAY_MS = 900;

const Tick = (
  <svg viewBox="0 0 256 256" width="10" height="10" fill="none" aria-hidden="true">
    <polyline
      points="216 72 104 184 48 128"
      stroke="currentColor"
      strokeWidth="26"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Arc({ spin }: { spin: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      aria-hidden="true"
      animate={spin ? { rotate: 360 } : { rotate: 0 }}
      transition={spin ? { duration: 0.8, ease: "linear", repeat: Infinity } : STILL}
    >
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M8 2 a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
  );
}

/**
 * "How it works" as a self-running checklist instead of a static timeline:
 * each row loads (spinner), ticks done, and reveals its description —
 * literal automation imagery for a product whose whole pitch is "job
 * hunting, automated." Starts once scrolled into view, runs through once
 * (doesn't loop — this is an explainer, not a live status widget), and
 * collapses to every row already done + every description visible under
 * prefers-reduced-motion.
 */
export function HowItWorksFlow() {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (reduce || !inView || current >= STEPS.length) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), STEP_DELAY_MS);
    return () => clearTimeout(t);
  }, [reduce, inView, current]);

  const rows = STEPS.map((step, i) => {
    const status: Status = reduce
      ? "done"
      : !inView
        ? "pending"
        : i < current
          ? "done"
          : i === current
            ? "active"
            : "pending";
    return { ...step, status };
  });

  return (
    <ol aria-label="How it works" ref={listRef} className="mkt-checklist">
      {rows.map((row) => (
        <li key={row.id} className="mkt-checklist-row" aria-current={row.status === "active" ? "step" : undefined}>
          <div className="mkt-checklist-head">
            <span className="mkt-checklist-box">
              <AnimatePresence initial={false}>
                {row.status === "done" ? (
                  <motion.span
                    key="done"
                    className="mkt-checklist-icon done"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, transition: STILL }}
                    transition={reduce ? STILL : POP}
                  >
                    {Tick}
                  </motion.span>
                ) : row.status === "active" ? (
                  <motion.span
                    key="active"
                    className="mkt-checklist-icon active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: STILL }}
                  >
                    <Arc spin={!reduce} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="pending"
                    className="mkt-checklist-icon pending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: STILL }}
                  />
                )}
              </AnimatePresence>
            </span>
            <span className={`mkt-checklist-label ${row.status}`}>{row.label}</span>
          </div>
          <AnimatePresence initial={false}>
            {row.status === "done" && (
              <motion.div
                className="mkt-checklist-body"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, transition: STILL }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="mkt-checklist-detail">{row.detail}</p>
                <span className="mkt-checklist-meta">{row.seconds}s</span>
              </motion.div>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ol>
  );
}
