import { statusMeta, TONE_CLASS } from "@/lib/status";
import { cn } from "@/lib/utils";

/** Status as a dot plus a word, never colour alone. */
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const meta = statusMeta(status);
  const tone = TONE_CLASS[meta.tone];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded border px-2 font-mono text-[11px]",
        tone.soft,
        tone.text,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", tone.dot)} />
      {meta.label}
    </span>
  );
}
