"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { EASE } from "@/components/system/motion";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    name: "Job matches",
    line: "Scored against you, not keywords.",
    body: "Every match carries a fit score, the model's reasoning, the skills you have and the ones you lack. Search and filter live in the URL, so a view is a link.",
  },
  {
    name: "Resume tailoring",
    line: "Rewritten per posting, layout kept.",
    body: "An LLM rewrites the content while preserving your original layout. The base file is stored in Postgres; the tailored copy is stored as HTML and rendered to PDF on download, so versions never drift from a template.",
  },
  {
    name: "Company research",
    line: "A brief before you apply.",
    body: "The agent reads the company site and recent news, then writes an overview, why they're hiring, talking points, questions to ask and red flags.",
  },
  {
    name: "Interview prep",
    line: "A guide for this interview.",
    body: "Role analysis, behavioural and technical questions, STAR scaffolds and salary guidance, rendered in a sandboxed frame and downloadable as a PDF.",
  },
  {
    name: "Application tracking",
    line: "Applied to offer, with conversion.",
    body: "A four-stage pipeline with per-stage conversion, an interview scheduler, and follow-up logging that recomputes your response rate on the server.",
  },
] as const;

export function FeatureRows() {
  const [open, setOpen] = useState(0);

  return (
    <ul className="border-t border-line">
      {FEATURES.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.name} className="border-b border-line">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={`feature-${i}`}
                className="group grid w-full grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-6 text-left md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,0.9fr)_auto]"
              >
                <span className={cn("font-mono text-xs transition-colors", isOpen ? "text-accent" : "text-ink-3")}>
                  0{i + 1}
                </span>
                <span className="font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-none text-ink transition-transform duration-300 group-hover:translate-x-1.5">
                  {f.name}
                </span>
                <span className="hidden text-ink-3 md:block">{f.line}</span>
                <Plus
                  size={18}
                  aria-hidden="true"
                  className={cn("self-center text-ink-3 transition-transform duration-300", isOpen && "rotate-45 text-accent")}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`feature-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[62ch] pb-8 leading-relaxed text-ink-2 md:ml-[5rem]">{f.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
