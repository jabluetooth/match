"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/system/wordmark";
import { MarketingSignInButton } from "@/components/marketing-sign-in-button";
import { GITHUB_URL, SECTIONS } from "@/lib/marketing";
import { cn } from "@/lib/utils";

/** One-page site: the active link follows whichever section holds the viewport. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export function SiteHeader() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  // The hairline appears only once content slides under the bar.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-bg/80 backdrop-blur-md transition-colors duration-200",
        scrolled || open ? "border-line" : "border-transparent",
      )}
    >
      <div className="flex h-16 items-center justify-between gap-6 px-[5vw]">
        <a href="#top" aria-label="Match, back to top" className="text-[28px]">
          <Wordmark />
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {SECTIONS.map(({ id, label }) => (
              <li key={id} className="relative">
                <a
                  href={`#${id}`}
                  className={cn(
                    "py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                    active === id ? "text-ink" : "text-ink-3 hover:text-ink",
                  )}
                >
                  {label}
                </a>
                {active === id && (
                  <motion.span
                    layoutId="site-nav-underline"
                    className="absolute -bottom-1 left-0 h-px w-full bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 transition-colors hover:text-ink md:inline"
          >
            Source
          </a>
          <MarketingSignInButton className="btn btn-primary btn-sm ml-3">Sign in</MarketingSignInButton>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-sections"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded border border-line text-ink-2 md:hidden"
          >
            {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-sections"
            aria-label="Sections"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-line px-[5vw] pb-6 md:hidden"
          >
            <ul>
              {SECTIONS.map(({ id, label }) => (
                <li key={id} className="border-b border-line">
                  <a href={`#${id}`} onClick={() => setOpen(false)} className="block py-4 font-display text-3xl text-ink">
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="block py-4 font-display text-3xl text-ink">
                  Source
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
