"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { Wordmark } from "@/components/system/wordmark";
import { NAV_ITEMS, activeHref } from "@/components/app-shell/nav-items";
import { cn } from "@/lib/utils";

/** "g" then a letter jumps to a section, Linear-style. Ignored while typing. */
function useGoShortcuts() {
  const router = useRouter();
  const armed = useRef<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;

      const key = e.key.toLowerCase();
      if (armed.current !== null) {
        window.clearTimeout(armed.current);
        armed.current = null;
        const item = NAV_ITEMS.find((n) => n.key === key);
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
        return;
      }
      if (key === "g") {
        armed.current = window.setTimeout(() => {
          armed.current = null;
        }, 1200);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}

export function NavList({ onNavigate, layoutId }: { onNavigate?: () => void; layoutId: string }) {
  const pathname = usePathname();
  const current = activeHref(pathname);

  return (
    <ul className="space-y-0.5">
      {NAV_ITEMS.map(({ name, href, icon: Icon, key }) => {
        const active = current === href;
        return (
          <li key={href} className="relative">
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md border border-line bg-raised"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-9 items-center gap-3 rounded-md px-3 text-[13px] transition-colors",
                active ? "text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              <Icon size={15} aria-hidden="true" className={active ? "text-accent" : "text-ink-3 group-hover:text-ink-2"} />
              <span className="flex-1">{name}</span>
              <kbd className="hidden font-mono text-[10px] uppercase text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 lg:inline">
                g {key}
              </kbd>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  useGoShortcuts();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-w)] flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-[var(--topbar-h)] items-center px-5">
        <Link href="/dashboard" aria-label="Match dashboard" className="text-[26px]">
          <Wordmark />
        </Link>
      </div>

      <nav aria-label="App" className="flex-1 px-3 pt-4">
        <p className="eyebrow mb-2 px-3">Workspace</p>
        <NavList layoutId="sidebar-active" />
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="mb-3 font-mono text-[10px] leading-relaxed text-ink-3">
          Press <kbd className="text-ink-2">g</kbd> then a letter to jump.
        </p>
        <UserButton showName appearance={{ elements: { userButtonBox: "flex-row-reverse", avatarBox: "size-7" } }} />
      </div>
    </aside>
  );
}
