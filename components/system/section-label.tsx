import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Match's label: an amber index, a short rule, then the name, like a line
 * in a ledger. It replaces the rounded "sparkle pill" badge.
 */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3", className)}>
      {index && <span className="text-accent">{index}</span>}
      <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
      <span>{children}</span>
    </span>
  );
}
