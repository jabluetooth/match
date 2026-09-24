"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, activeHref } from "@/components/app-shell/nav-items";

/** "match / applications" — where you are, in the topbar. */
export function Crumb() {
  const pathname = usePathname();
  const href = activeHref(pathname);
  const section = NAV_ITEMS.find((n) => n.href === href)?.name ?? "";
  const sub = pathname.startsWith("/research") ? "research" : pathname.startsWith("/interview-prep") ? "prep guide" : null;

  return (
    <p className="flex min-w-0 items-center gap-2 truncate font-mono text-xs text-ink-3">
      <span className="hidden sm:inline">match</span>
      <span aria-hidden="true" className="hidden text-line-strong sm:inline">/</span>
      <span className="text-ink-2">{section.toLowerCase()}</span>
      {sub && (
        <>
          <span aria-hidden="true" className="text-line-strong">/</span>
          <span className="text-ink-2">{sub}</span>
        </>
      )}
    </p>
  );
}
