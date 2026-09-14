"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  FileText,
  Sparkles,
  Building2,
  MessageSquareText,
  KanbanSquare,
  type LucideIcon,
} from "lucide-react";
import { handleSpotlightMove } from "@/lib/spotlight";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Feature {
  Icon: LucideIcon;
  title: string;
  body: string;
}

/* Split into two homogeneous groups instead of one mixed grid. Mixing a
   long-copy primary card with a one-line supporting card in the same row
   (top-aligned) made heights disagree card to card — nothing to do with
   grid placement, it just never reads as "uniform" when the two things
   sharing a row aren't the same kind of thing. Each group below is its own
   grid with align-items: stretch, so every card in it matches height. */
const PRIMARY: Feature[] = [
  {
    Icon: FileText,
    title: "Resume tailoring",
    body: "An LLM rewrites content while preserving the original layout. The base PDF is stored as BYTEA; the tailored copy is stored as HTML and rendered to PDF on download — no template drift between versions.",
  },
  {
    Icon: KanbanSquare,
    title: "Application tracking",
    body: "A status pipeline with per-stage conversion rates, scheduled-interview modal, and follow-up logging that server-side recomputes your response rate.",
  },
];

const SUPPORTING: Feature[] = [
  {
    Icon: Sparkles,
    title: "Job matches",
    body: "AI-scored against your profile, with skill chips and URL-state search + filters.",
  },
  {
    Icon: Building2,
    title: "Company research",
    body: "Scrapes the company site and recent news into a brief: mission, why-hiring, talking points, red flags.",
  },
  {
    Icon: MessageSquareText,
    title: "Interview prep",
    body: "Role analysis, behavioural + technical questions, STAR scaffolds, salary guidance — rendered in a sandboxed iframe.",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

/* Headings "focus in": they start slightly wide-tracked and fade, then
   settle to their resting letter-spacing a beat after the card itself has
   scaled/faded in — a typographic entrance instead of just riding the
   card's own motion. */
const headingVariants: Variants = {
  hidden: { opacity: 0, letterSpacing: "0.05em" },
  show: {
    opacity: 1,
    letterSpacing: "-0.015em",
    transition: { duration: 0.5, ease: EASE, delay: 0.14 },
  },
};

export function FeaturesBento() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <>
        <div className="mkt-bento mkt-bento-primary">
          {PRIMARY.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} primary static />
          ))}
        </div>
        <div className="mkt-bento mkt-bento-support">
          {SUPPORTING.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} static />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <motion.div
        className="mkt-bento mkt-bento-primary"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
      >
        {PRIMARY.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} primary />
        ))}
      </motion.div>
      <motion.div
        className="mkt-bento mkt-bento-support"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
      >
        {SUPPORTING.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </motion.div>
    </>
  );
}

function FeatureCard({
  feature,
  primary,
  static: isStatic,
}: {
  feature: Feature;
  primary?: boolean;
  static?: boolean;
}) {
  const { Icon, title, body } = feature;
  const className = `mkt-bento-item mkt-spot${primary ? " primary" : ""}`;

  if (isStatic) {
    return (
      <div className={className}>
        <Icon size={primary ? 26 : 20} color="var(--accent-c)" />
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    );
  }

  return (
    <motion.div className={className} variants={cardVariants} onMouseMove={handleSpotlightMove}>
      <Icon size={primary ? 26 : 20} color="var(--accent-c)" />
      <motion.h3 variants={headingVariants}>{title}</motion.h3>
      <p>{body}</p>
    </motion.div>
  );
}
