"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/system/wordmark";
import { NavList } from "@/components/app-shell/sidebar";
import { EASE } from "@/components/system/motion";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className="grid size-9 place-items-center rounded-md border border-line text-ink-2 hover:text-ink"
      >
        <Menu size={16} aria-hidden="true" />
      </button>

      {/* Portalled: the topbar's backdrop-filter would otherwise become the
          containing block and trap this fixed drawer inside the bar. */}
      {mounted && createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-bg/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id="mobile-drawer"
              aria-label="App navigation"
              className="fixed inset-y-0 left-0 z-50 flex w-[min(80vw,280px)] flex-col border-r border-line bg-surface"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="flex h-[var(--topbar-h)] items-center justify-between px-5">
                <Link href="/dashboard" className="text-[26px]" aria-label="Match dashboard">
                  <Wordmark />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="grid size-9 place-items-center rounded-md text-ink-2 hover:text-ink"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <nav className="px-3 pt-4">
                <NavList layoutId="drawer-active" onNavigate={() => setOpen(false)} />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  );
}
