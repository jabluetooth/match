"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const fromLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

const fromRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE, delay: 0.12 } },
};

/**
 * The quote slides in from the left, the explanation from the right — a
 * converging pair instead of a single flat fade. Both columns share the
 * same top offset (the decorative mark is zero-height + transformed
 * upward, not stacked in flow) so their first lines align regardless of
 * font size. Collapses to a static, motionless layout under
 * prefers-reduced-motion.
 */
export function WhyThisExists() {
  const reduce = useReducedMotion();

  const quote = (
    <>
      <span className="mkt-why-mark" aria-hidden="true">&ldquo;</span>
      <p className="mkt-quote">
        Match automates the parts a computer should do, and
        surfaces the parts you need to see.
      </p>
    </>
  );

  const copy = (
    <p className="mkt-quote-sub">
      Job hunting is a manual, repetitive workflow: scrape boards, score
      fit, rewrite the resume to match each posting, research the company,
      prep for interviews, track every reply. Match handles the repetitive
      parts and keeps you in the loop on everything that actually needs a
      human decision.
    </p>
  );

  if (reduce) {
    return (
      <div className="mkt-why">
        <div className="mkt-why-quote">{quote}</div>
        <div className="mkt-why-copy">{copy}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="mkt-why"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      <motion.div className="mkt-why-quote" variants={fromLeft}>
        {quote}
      </motion.div>
      <motion.div className="mkt-why-copy" variants={fromRight}>
        {copy}
      </motion.div>
    </motion.div>
  );
}
