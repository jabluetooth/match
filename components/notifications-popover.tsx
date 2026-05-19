"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Calendar, Mail, Sparkles, type LucideIcon } from "lucide-react";
import type { NotificationItem, NotificationKind } from "@/lib/notifications";

interface NotificationsPopoverProps {
  items: NotificationItem[];
}

const KIND_STYLE: Record<NotificationKind, { icon: LucideIcon; color: string; bg: string }> = {
  interview: { icon: Calendar, color: "#6d28d9",            bg: "#ede9fe" },
  followup:  { icon: Mail,     color: "var(--warning)",     bg: "var(--warning-soft)" },
  match:     { icon: Sparkles, color: "var(--accent-strong)", bg: "var(--primary-soft)" },
};

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const diff = date.getTime() - Date.now();
  const absDays = Math.round(Math.abs(diff) / 86_400_000);
  const isFuture = diff > 0;
  if (Math.abs(diff) < 3_600_000) {
    const mins = Math.max(1, Math.round(Math.abs(diff) / 60_000));
    return isFuture ? `in ${mins}m` : `${mins}m ago`;
  }
  if (Math.abs(diff) < 86_400_000) {
    const hrs = Math.max(1, Math.round(Math.abs(diff) / 3_600_000));
    return isFuture ? `in ${hrs}h` : `${hrs}h ago`;
  }
  return isFuture ? `in ${absDays}d` : `${absDays}d ago`;
}

export function NotificationsPopover({ items }: NotificationsPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = items.length;
  const urgentCount = items.filter((i) => i.urgent).length;

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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={count > 0 ? `Notifications, ${count} pending` : "Notifications, all caught up"}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell size={16} />
        {count > 0 && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              background: urgentCount > 0 ? "var(--danger)" : "var(--accent-strong)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              lineHeight: "16px",
              textAlign: "center",
              boxShadow: "0 0 0 2px #fff",
            }}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: 340,
            maxWidth: "calc(100vw - 32px)",
            background: "rgba(20, 22, 30, 0.92)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            boxShadow: "var(--shadow-pop)",
            zIndex: 30,
            overflow: "hidden",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
              Notifications
            </p>
            {count > 0 && (
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                {count} pending
              </span>
            )}
          </header>

          {items.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>
                You're all caught up.
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-3)" }}>
                No upcoming interviews or pending follow-ups.
              </p>
            </div>
          ) : (
            <ul
              role="list"
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {items.map((item) => {
                const style = KIND_STYLE[item.kind];
                const Icon = style.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--line)",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "background .12s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 30,
                          height: 30,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 9,
                          background: style.bg,
                          color: style.color,
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={14} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--ink)",
                            lineHeight: 1.3,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {item.urgent && (
                            <span
                              aria-label="Urgent"
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "var(--danger)",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.title}
                          </span>
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11.5,
                            color: "var(--ink-3)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.subtitle}
                          </span>
                          {item.timestamp && (
                            <>
                              <span aria-hidden style={{ opacity: 0.5 }}>·</span>
                              <span>{formatRelative(item.timestamp)}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
