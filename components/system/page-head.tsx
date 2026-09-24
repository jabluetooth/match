import type { ReactNode } from "react";

interface PageHeadProps {
  /** Mono crumb above the title, e.g. "02 · pipeline". */
  kicker: string;
  /** Serif title. Wrap the key word in <em> for the amber italic. */
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
}

/**
 * Every app page opens the same way: a mono kicker, a serif title with one
 * italic amber word, a one-line lead, and actions on the right.
 */
export function PageHead({ kicker, title, lead, actions }: PageHeadProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow">{kicker}</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,3.6vw,2.75rem)] leading-[1.02] tracking-[-0.015em] text-ink [&_em]:text-accent-ink">
          {title}
        </h1>
        {lead && <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-2">{lead}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
