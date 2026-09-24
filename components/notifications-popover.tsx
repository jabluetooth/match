"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CalendarDays, Mail, Target, type LucideIcon } from "lucide-react";
import type { NotificationItem, NotificationKind } from "@/lib/notifications";
import { EASE } from "@/components/system/motion";
import { cn } from "@/lib/utils";

interface NotificationsPopoverProps {
  items: NotificationItem[];
}

// Violet only for interviews (its reserved colour); follow-ups are a
// "waiting" state, so warning; matches are the brand's own news, so amber.
const KIND_STYLE: Record<NotificationKind, { icon: LucideIcon; className: string }> = {
  interview: { icon: CalendarDays, className: "bg-interview/15 text-interview-ink" },
  followup: { icon: Mail, className: "bg-warning/10 text-warning" },
  match: { icon: Target, className: "bg-accent/10 text-accent-ink" },
};

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const future = diff > 0;
  let n: string;
  if (abs < 3_600_000) n = `${Math.max(1, Math.round(abs / 60_000))}m`;
  else if (abs < 86_400_000) n = `${Math.max(1, Math.round(abs / 3_600_000))}h`;
  else n = `${Math.round(abs / 86_400_000)}d`;
  return future ? `in ${n}` : `${n} ago`;
}

export function NotificationsPopover({ items }: NotificationsPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = items.length;
  const urgent = items.some((i) => i.urgent);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={count > 0 ? `Notifications, ${count} pending` : "Notifications, all caught up"}
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative grid size-9 place-items-center rounded-md border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
      >
        <Bell size={15} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 font-mono text-[10px] font-medium ring-2 ring-bg",
              urgent ? "bg-danger text-white" : "bg-accent text-accent-fg",
            )}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute right-0 top-[calc(100%+10px)] z-30 w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border border-line-strong bg-raised shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-[13px] font-medium text-ink">Notifications</p>
              {count > 0 && <span className="font-mono text-[11px] text-ink-3">{count} pending</span>}
            </div>

            {count === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-display text-xl text-ink">All caught up.</p>
                <p className="mt-1 text-xs text-ink-3">No upcoming interviews or follow-ups waiting on a reply.</p>
              </div>
            ) : (
              <ul className="max-h-[360px] overflow-y-auto">
                {items.map((item) => {
                  const { icon: Icon, className } = KIND_STYLE[item.kind];
                  return (
                    <li key={item.id} className="border-b border-line last:border-b-0">
                      <Link
                        href={item.href}
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface"
                      >
                        <span aria-hidden="true" className={cn("grid size-7 shrink-0 place-items-center rounded-md", className)}>
                          <Icon size={13} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-[13px] font-medium leading-snug text-ink">
                            {item.urgent && <span aria-label="Within 24 hours" className="size-1.5 shrink-0 rounded-full bg-danger" />}
                            <span className="truncate">{item.title}</span>
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
                            <span className="truncate">{item.subtitle}</span>
                            {item.timestamp && (
                              <span className="shrink-0 font-mono text-[11px]">· {formatRelative(item.timestamp)}</span>
                            )}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
