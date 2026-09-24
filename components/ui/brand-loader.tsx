"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { STAGES, STAGE_LABEL } from "@/lib/status";
import { Wordmark } from "@/components/system/wordmark";
import { cn } from "@/lib/utils";

interface BrandLoaderProps {
  /** Fullscreen overlay over the whole app. Default true. */
  fullScreen?: boolean;
  /** Hide the wordmark. Default false. */
  hideTitle?: boolean;
  /** Optional headline under the rail. */
  label?: string;
  /** Optional supporting message; cross-fades via messageVisible. */
  message?: string;
  messageVisible?: boolean;
  /**
   * Wait this long before showing anything, so quick navigations don't
   * flash a loader. Defaults to 200ms inline, 0 for fullscreen overlays
   * (those follow a click, and should acknowledge it at once).
   */
  delayMs?: number;
}

// Violet only on the interview stage, green once there's an offer: the
// same colours the pipeline rail uses everywhere else.
const LIT = ["bg-accent", "bg-accent", "bg-interview", "bg-success"] as const;

const STEP_MS = 380;
// Steps 1–4 light the stages in order; 5–6 hold all four lit; 0 clears.
const CYCLE = STAGES.length + 3;

/**
 * The loader is the pipeline rail running: Applied → Screened → Interview →
 * Offer light up one at a time from a single shared counter (so they can't
 * drift out of step), hold, then clear together and start over.
 */
export function BrandLoader({
  fullScreen = true,
  hideTitle = false,
  label,
  message,
  messageVisible = true,
  delayMs,
}: BrandLoaderProps) {
  const reduce = useReducedMotion();
  const wait = delayMs ?? (fullScreen ? 0 : 200);

  // Fullscreen overlays portal to <body> so `position: fixed` is anchored to
  // the viewport even inside a transformed ancestor (job-matches-paged.tsx).
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(wait === 0);
  const [step, setStep] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (wait === 0) return;
    const t = setTimeout(() => setVisible(true), wait);
    return () => clearTimeout(t);
  }, [wait]);

  useEffect(() => {
    if (!visible || reduce) return;
    const t = setInterval(() => setStep((s) => (s + 1) % CYCLE), STEP_MS);
    return () => clearInterval(t);
  }, [visible, reduce]);

  // Reduced motion: a still rail with every stage lit.
  const lit = reduce ? STAGES.length : step;

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300",
        fullScreen ? "fixed inset-0 z-[9000] bg-bg/90 backdrop-blur-sm" : "min-h-[60vh]",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {!hideTitle && <Wordmark className="mb-8 text-5xl" />}

      <div className="flex items-end gap-2" aria-hidden="true">
        {STAGES.map((stage, i) => {
          const on = i < lit;
          return (
            <div key={stage} className="flex w-[76px] flex-col items-center gap-2">
              <span className="relative block h-1 w-full overflow-hidden rounded-full bg-line-strong">
                <span
                  className={cn(
                    "absolute inset-0 origin-left rounded-full transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                    LIT[i],
                    on ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300",
                  on ? "text-ink-2" : "text-ink-3",
                )}
              >
                {STAGE_LABEL[stage]}
              </span>
            </div>
          );
        })}
      </div>

      {label && <p className="mt-6 text-sm font-medium text-ink-2">{label}</p>}
      {message && (
        <p
          className={cn(
            "mx-auto mt-6 max-w-[40ch] text-[13px] leading-relaxed text-ink-2 transition-[opacity,transform] duration-300",
            messageVisible ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
          )}
        >
          {message}
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );

  if (fullScreen && mounted) return createPortal(content, document.body);
  return content;
}
