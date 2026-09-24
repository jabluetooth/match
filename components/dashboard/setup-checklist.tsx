import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "done" | "active" | "pending";

export interface OnboardingStep {
  num: number;
  title: string;
  desc: string;
  action: string;
  href: string;
  status: StepStatus;
}

/**
 * Five setup steps as a checklist. Only the active step offers an action,
 * so there's always exactly one obvious next thing to do. Once everything
 * is done the whole panel folds down to a single line.
 */
export function SetupChecklist({ steps }: { steps: OnboardingStep[] }) {
  const done = steps.filter((s) => s.status === "done").length;

  if (done === steps.length) {
    return (
      <p className="flex items-center gap-2 font-mono text-xs text-ink-3">
        <Check size={13} className="text-success" aria-hidden="true" />
        Setup complete: profile, matches, an application and an interview.
      </p>
    );
  }

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="setup-title">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="eyebrow">Setup</p>
          <h2 id="setup-title" className="mt-1 font-display text-2xl text-ink">
            Getting <em className="text-accent-ink">started</em>
          </h2>
        </div>
        <p className="font-mono text-sm text-ink-2">
          <span className="text-ink">{done}</span>/{steps.length}
        </p>
      </div>

      <div className="mt-4 flex gap-1" aria-hidden="true">
        {steps.map((s) => (
          <span key={s.num} className={cn("h-1 flex-1 rounded-full", s.status === "done" ? "bg-accent" : "bg-line-strong")} />
        ))}
      </div>

      <ol className="mt-5 divide-y divide-line">
        {steps.map((s) => (
          <li
            key={s.num}
            aria-current={s.status === "active" ? "step" : undefined}
            className="flex items-center gap-4 py-3"
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded font-mono text-[11px]",
                s.status === "done" && "bg-accent/15 text-accent-ink",
                s.status === "active" && "border border-accent text-accent-ink",
                s.status === "pending" && "border border-line-strong text-ink-3",
              )}
            >
              {s.status === "done" ? <Check size={12} aria-label="Done" /> : s.num}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm", s.status === "pending" ? "text-ink-3" : "text-ink", s.status === "done" && "text-ink-2 line-through decoration-line-strong")}>
                {s.title}
              </p>
              {s.status === "active" && <p className="mt-0.5 text-xs text-ink-3">{s.desc}</p>}
            </div>
            {s.status === "active" && s.href && (
              <Link href={s.href} className="btn btn-primary btn-sm">
                {s.action}
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
