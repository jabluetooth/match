"use client";

import { motion } from "framer-motion";
import { STAGES, STAGE_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";
import { CountUp, EASE } from "@/components/system/motion";

// Literal classes per stage: amber until an interview, violet for the
// interview stage (its reserved colour), green once there's an offer.
const FILL: Record<(typeof STAGES)[number], string> = {
  applied: "bg-accent",
  screened: "bg-accent",
  interview: "bg-interview",
  offer: "bg-success",
};

interface StageTicksProps {
  /** Index of the furthest stage reached; -1 before applying. */
  reached: number;
  closed?: boolean;
  className?: string;
}

/**
 * The compact rail: four short segments, one per stage. It sits on every
 * application row so you can read how far each one got at a glance.
 */
export function StageTicks({ reached, closed, className }: StageTicksProps) {
  const label = closed
    ? "Closed"
    : reached < 0
      ? "Not applied yet"
      : `Reached ${STAGE_LABEL[STAGES[reached]]}`;
  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-[3px]", className)}>
      {STAGES.map((stage, i) => (
        <span
          key={stage}
          className={cn(
            "h-1.5 w-4 rounded-[1px]",
            closed ? "bg-line-strong/60" : i <= reached ? FILL[stage] : "bg-line-strong",
          )}
        />
      ))}
    </span>
  );
}

export interface RailStage {
  key: string;
  label: string;
  /** Cumulative: applications that reached this stage or later. */
  count: number;
}

/**
 * The full pipeline rail: each stage is a column with its count, a bar
 * scaled against everything you've applied to, and the conversion from the
 * stage before. The bars fill left to right as the rail scrolls in.
 */
export function PipelineRail({ stages, className }: { stages: RailStage[]; className?: string }) {
  const base = stages[0]?.count ?? 0;
  return (
    <ol className={cn("grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-0", className)}>
      {stages.map((stage, i) => {
        const prev = i > 0 ? stages[i - 1].count : null;
        const conversion = prev ? Math.round((stage.count / prev) * 100) : null;
        const share = base > 0 ? stage.count / base : 0;
        const fill = FILL[(stage.key as (typeof STAGES)[number])] ?? "bg-accent";
        return (
          <li key={stage.key} className="min-w-0 sm:border-l sm:border-line sm:px-5 sm:first:border-l-0 sm:first:pl-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                <span className="text-ink-2">0{i + 1}</span> {stage.label}
              </span>
              {conversion !== null && (
                <span className="font-mono text-[11px] text-ink-3" title={`${conversion}% of the stage before`}>
                  {conversion}%
                </span>
              )}
            </div>
            <CountUp value={stage.count} className="mt-2 block font-mono text-4xl font-medium tracking-tight text-ink" />
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
              <motion.div
                className={cn("h-full origin-left rounded-full", fill)}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: share }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.1 }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
