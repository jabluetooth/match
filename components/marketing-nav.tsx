"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MarketingSignInButton } from "@/components/marketing-sign-in-button";
import { cn } from "@/lib/utils";
import { GITHUB_URL } from "@/lib/marketing";

const LINKS = [
  { name: "Home", href: "#top" },
  { name: "What it does", href: "#features" },
  { name: "How it works", href: "#how-it-works" },
  { name: "Engineering", href: "#engineering" },
] as const;

const SECTION_IDS = LINKS.map((link) => link.href.slice(1));

/** One-page site: tracks which anchored section is nearest the top of the
    viewport instead of comparing against a route pathname. */
function useActiveSection() {
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActive(topMost.target.id);
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}

export function MarketingNav() {
  const active = useActiveSection();

  return (
    <nav className="mkt-nav">
      <Link href="#top" className="logo">match</Link>
      <div className="mkt-nav-links">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={cn("mkt-nav-link", active === link.href.slice(1) && "active")}
          >
            {link.name}
          </a>
        ))}
        <div className="mkt-nav-divider" />
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mkt-link-ghost"
        >
          View source
        </a>
        <MarketingSignInButton className="btn btn-primary btn-sm">
          Sign In
        </MarketingSignInButton>
      </div>
    </nav>
  );
}
