import Link from "next/link";
import { CountUp } from "@/components/system/motion";
import { cn } from "@/lib/utils";

export interface Reading {
  label: string;
  value: number;
  sub: string;
  href: string;
  /** Interview readings wear the interview violet; everything else stays neutral. */
  interview?: boolean;
}

/**
 * Four readings in one ruled strip rather than four floating tiles: the
 * number is the content, so it gets the mono numerals and nothing else
 * competes with it.
 */
export function Readings({ items }: { items: Reading[] }) {
  return (
    <dl className="panel grid grid-cols-2 lg:grid-cols-4">
      {items.map((r, i) => (
        <Link
          key={r.label}
          href={r.href}
          className={cn(
            "group block border-line p-5 transition-colors hover:bg-raised/60",
            i % 2 === 1 && "border-l",
            i >= 2 && "border-t lg:border-t-0",
            i === 2 && "lg:border-l",
          )}
        >
          <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
            {r.interview && <span aria-hidden="true" className="size-1.5 rounded-full bg-interview" />}
            {r.label}
          </dt>
          <dd className="mt-3">
            <CountUp
              value={r.value}
              className={cn("block font-mono text-[2.75rem] font-medium leading-none tracking-[-0.04em]", r.interview ? "text-interview-ink" : "text-ink")}
            />
            <span className="mt-2 block truncate text-xs text-ink-3 group-hover:text-ink-2">{r.sub}</span>
          </dd>
        </Link>
      ))}
    </dl>
  );
}
