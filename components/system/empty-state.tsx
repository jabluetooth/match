import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-14 text-center">
      <span className="grid size-10 place-items-center rounded-md border border-line bg-raised text-ink-2">
        <Icon size={18} aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-2xl text-ink">{title}</h3>
      <div className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-ink-2">{body}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
