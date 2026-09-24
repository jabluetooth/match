import { cn } from "@/lib/utils";

/**
 * "match%" — a serif word with a mono percent sign. The percent is the
 * product in one glyph: every role Match finds arrives with a fit score.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline font-display leading-none tracking-[-0.01em] text-ink", className)}>
      match
      <span className="ml-[0.06em] font-mono text-[0.62em] font-medium text-accent" aria-hidden="true">
        %
      </span>
    </span>
  );
}
