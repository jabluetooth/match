import { cn } from "@/lib/utils";

const TICKS = 20;

interface FitScoreProps {
  score: number;
  size?: "md" | "lg";
  className?: string;
}

/**
 * Match's signature: the fit score as mono numerals over a tick meter,
 * like a reading on an instrument. Twenty ticks, one per five points.
 */
export function FitScore({ score, size = "md", className }: FitScoreProps) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const lit = Math.round((value / 100) * TICKS);
  return (
    <div className={cn("inline-flex flex-col", className)} role="img" aria-label={`Fit score ${value} out of 100`}>
      <span
        className={cn(
          "font-mono font-medium leading-none tracking-[-0.04em] text-ink",
          size === "lg" ? "text-6xl" : "text-[2.5rem]",
        )}
        aria-hidden="true"
      >
        {value}
        <span className={cn("ml-0.5 align-top text-accent", size === "lg" ? "text-2xl" : "text-base")}>%</span>
      </span>
      <span className="mt-2 flex gap-[2px]" aria-hidden="true">
        {Array.from({ length: TICKS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-[1px]",
              size === "lg" ? "h-3" : "h-2.5",
              i < lit ? "bg-accent" : "bg-line-strong",
            )}
          />
        ))}
      </span>
    </div>
  );
}
