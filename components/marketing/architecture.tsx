"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/system/motion";

const NODES = [
  { name: "Browser", stack: "Next.js 16 · React 19 · Clerk", detail: "You trigger an action: tailor, research, prep." },
  { name: "API routes", stack: "Next.js · Zod", detail: "Validate, sign the payload, POST it to n8n." },
  { name: "n8n", stack: "Groq · scrapers · PDF", detail: "The slow work runs off the request cycle." },
  { name: "Postgres", stack: "Neon · Prisma 7", detail: "n8n writes the result. The source of truth." },
  { name: "Browser", stack: "polling", detail: "The poller sees the row land and renders it." },
] as const;

/**
 * The round trip as a strip of five stations joined by a line that draws
 * itself through them. No websockets: the last station is the first one,
 * reading what n8n wrote.
 */
export function Architecture() {
  return (
    <ol className="relative grid gap-8 md:grid-cols-5 md:gap-4">
      <motion.span
        aria-hidden="true"
        className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-accent/50 md:block"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.4, ease: EASE }}
      />
      {NODES.map((n, i) => (
        <motion.li
          key={i}
          className="relative pl-7 md:pl-0"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.12 }}
        >
          <span aria-hidden="true" className="absolute left-0 top-0.5 size-[15px] rounded-full border-2 border-accent bg-bg md:relative md:block" />
          <p className="font-mono text-[11px] text-ink-3 md:mt-5">0{i + 1}</p>
          <p className="mt-1 font-display text-2xl leading-tight text-ink">{n.name}</p>
          <p className="mt-1 font-mono text-[11px] text-accent-ink">{n.stack}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{n.detail}</p>
        </motion.li>
      ))}
    </ol>
  );
}
