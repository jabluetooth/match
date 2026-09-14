"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const ARCHITECTURE_FLOW = [
  {
    title: "Browser — Next.js 16 · React 19 · Clerk",
    detail: "User triggers an action (tailor résumé, run research, request an interview brief).",
  },
  {
    title: "Next.js API routes",
    detail: "/api/match/jobs, /api/tailor/resume, /api/research/company sign the payload and POST to n8n.",
  },
  {
    title: "n8n workflow engine",
    detail: "Scrapes, calls Groq, renders PDFs — asynchronously, off the request/response cycle.",
  },
  {
    title: "PostgreSQL (Neon)",
    detail: "n8n writes the result; the frontend polls for it via direct Prisma reads.",
  },
  {
    title: "Back to the browser",
    detail: "The poller notices the row landed and renders it — no websockets, no lost state on refresh.",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/* Total stagger sequence for 5 items: delayChildren(0.04) +
   4 * staggerChildren(0.08) + one item's own duration(0.5) ≈ 0.86s. The
   line is the first child, so it starts at delayChildren alone (0.04s) and
   its own duration is set to land its finish right around when the last
   step's fade-in completes — it draws through the points as they appear,
   instead of running on a separate, unsynced timer. */
const lineVariants: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.82, ease: EASE } },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

/**
 * The connector line is a real animated element (motion.div, scaleY
 * 0 -> 1 from the top), driven by the same parent initial/whileInView
 * trigger as the step items below it — not a second, independent
 * viewport check, which could fire out of sync with (or fail to fire
 * alongside) the steps it's supposed to be drawing through. Its center
 * (left: 9px, 2px wide -> center at 10px) is what the step dots align to.
 */
export function ArchitectureFlow() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="mkt-flow"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
    >
      <motion.div
        className="mkt-flow-line"
        style={{ transformOrigin: "top" }}
        variants={reduce ? undefined : lineVariants}
      />
      {ARCHITECTURE_FLOW.map((step) => (
        <motion.div className="mkt-flow-step" key={step.title} variants={itemVariants}>
          <p className="mkt-flow-title">{step.title}</p>
          <p className="mkt-flow-detail">{step.detail}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
