"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, X } from "lucide-react";
import { useMatchScan, type ScanPhase } from "@/hooks/use-match-scan";
import { EASE } from "@/components/system/motion";
import { cn } from "@/lib/utils";

const STEPS: { phase: ScanPhase; label: string }[] = [
  { phase: "checking", label: "Checking" },
  { phase: "queued", label: "Queued" },
  { phase: "scoring", label: "Scoring" },
  { phase: "done", label: "Done" },
];
const ORDER: ScanPhase[] = ["checking", "queued", "scoring", "done"];

function useElapsed(from: number | null, to: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!from || to) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [from, to]);
  if (!from) return "0:00";
  const s = Math.max(0, Math.floor(((to ?? now) - from) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * The live view of a matching run: which step it's on, a tick per job in
 * the batch that lights as n8n writes each score, and how many cleared the
 * bar. Every number comes from the database, polled every few seconds.
 */
export function ScanProgress() {
  const { phase, expected, scored, strong, lastScore, startedAt, finishedAt, message, hidden, dismiss } = useMatchScan();
  const elapsed = useElapsed(startedAt, finishedAt);
  const running = phase === "checking" || phase === "queued" || phase === "scoring";
  const at = phase === "error" ? -1 : ORDER.indexOf(phase);

  return (
    <AnimatePresence initial={false}>
      {!hidden && phase !== "idle" && (
        <motion.section
          aria-label="Match scan progress"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="panel mb-6 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Steps */}
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em]">
                {STEPS.map((step, i) => {
                  const done = at > i || phase === "done";
                  const current = at === i && running;
                  return (
                    <li key={step.phase} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex items-center gap-1.5",
                          done ? "text-ink-2" : current ? "text-accent-ink" : "text-ink-3/60",
                        )}
                        aria-current={current ? "step" : undefined}
                      >
                        {done ? (
                          <Check size={11} className="text-accent" aria-hidden="true" />
                        ) : (
                          <span
                            aria-hidden="true"
                            className={cn("size-1.5 rounded-full", current ? "animate-stage-pulse bg-accent" : "bg-line-strong")}
                          />
                        )}
                        {step.label}
                      </span>
                      {i < STEPS.length - 1 && <span aria-hidden="true" className="h-px w-5 bg-line-strong" />}
                    </li>
                  );
                })}
              </ol>

              <div className="flex items-center gap-3 font-mono text-[11px] text-ink-3">
                <span aria-label="Elapsed time">{elapsed}</span>
                {!running && (
                  <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss scan result"
                    className="grid size-6 place-items-center rounded hover:bg-raised hover:text-ink"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* The batch: one tick per job n8n will score. */}
            {expected > 0 && (
              <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <p className="font-mono text-3xl font-medium leading-none tracking-[-0.04em] text-ink" aria-live="polite">
                    {scored}
                    <span className="text-base text-ink-3"> / {expected}</span>
                  </p>
                  <p className="eyebrow mt-2">jobs scored</p>
                </div>
                <div className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: expected }).map((_, i) => (
                    <span key={i} className="relative block h-6 w-2 overflow-hidden rounded-[2px] bg-line-strong">
                      <motion.span
                        className="absolute inset-0 origin-bottom bg-accent"
                        initial={false}
                        animate={{ scaleY: i < scored ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    </span>
                  ))}
                </div>
                <dl className="flex gap-6 font-mono text-xs">
                  <div>
                    <dt className="text-ink-3">strong</dt>
                    <dd className="mt-0.5 text-ink">{strong}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">last score</dt>
                    <dd className="mt-0.5 text-ink">{lastScore != null ? `${Math.round(lastScore)}%` : "—"}</dd>
                  </div>
                </dl>
              </div>
            )}

            <p
              className={cn(
                "mt-4 flex items-start gap-2 text-[13px] leading-relaxed",
                phase === "error" ? "text-danger" : "text-ink-2",
              )}
              role={phase === "error" ? "alert" : undefined}
            >
              {phase === "error" && <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />}
              {message ??
                (phase === "checking"
                  ? "Looking for jobs you haven't been scored against yet…"
                  : phase === "queued"
                    ? "Sent to n8n. The first score usually lands within half a minute."
                    : "Scoring each job against your profile. Scores land one by one; you can leave this page.")}
            </p>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
