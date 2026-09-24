"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
}

// Violet only on the interview stage, as everywhere else.
const LIT = ["bg-accent", "bg-accent", "bg-interview", "bg-accent"] as const;

/**
 * The loader is the pipeline rail running: four stages light up in turn,
 * Applied → Offer, then start over. No orb, no spinner.
 */
export function BrandLoader({ fullScreen = true, hideTitle = false, label, message, messageVisible = true }: BrandLoaderProps) {
  // Fullscreen overlays portal to <body> so `position: fixed` is anchored to
  // the viewport even inside a transformed ancestor (job-matches-paged.tsx).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        fullScreen ? "fixed inset-0 z-[9000] bg-bg/90 backdrop-blur-sm" : "min-h-[60vh]",
      )}
    >
      {!hideTitle && <Wordmark className="mb-8 text-5xl" />}

      <div className="flex items-end gap-2" aria-hidden="true">
        {STAGES.map((stage, i) => (
          <div key={stage} className="flex w-[76px] flex-col items-center gap-2">
            <span className="relative block h-1 w-full overflow-hidden rounded-full bg-line-strong">
              <span
                className={cn("absolute inset-0 origin-left animate-[loader-fill_2.4s_cubic-bezier(0.16,1,0.3,1)_infinite] rounded-full motion-reduce:animate-none", LIT[i])}
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">{STAGE_LABEL[stage]}</span>
          </div>
        ))}
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

      <style>{`
        @keyframes loader-fill {
          0% { transform: scaleX(0); opacity: 1; }
          40% { transform: scaleX(1); opacity: 1; }
          80% { transform: scaleX(1); opacity: 0.25; }
          100% { transform: scaleX(1); opacity: 0; }
        }
      `}</style>
    </div>
  );

  if (fullScreen && mounted) return createPortal(content, document.body);
  return content;
}
