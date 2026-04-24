"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Search, Bell, Sparkles } from "lucide-react";
import Link from "next/link";
import { GooeyInput } from "@/components/ui/gooey-input";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function Header() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const isJobs = pathname === "/jobs";
  const [matching, setMatching] = useState(false);

  const handleFindMatches = async () => {
    if (!userId) return;
    setMatching(true);
    try {
      const res = await fetch("/api/match/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error("Failed");
      alert("Job matching started! New matches will appear shortly.");
      window.location.reload();
    } catch {
      alert("Failed to start job matching. Please try again.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <header className="topbar">
      {/* Left — logo */}
      <Link href="/" className="logo">
        match
      </Link>

      {/* Center — search / gooey input */}
      <div className="topbar-center">
        {isJobs ? (
          <GooeyInput
            placeholder="Search jobs, companies..."
            collapsedWidth={150}
            expandedWidth={520}
            expandedOffset={48}
            gooeyBlur={5}
            filters={{
              location: {
                options: [
                  { label: "Remote",  value: "remote" },
                  { label: "Hybrid",  value: "hybrid" },
                  { label: "On-site", value: "onsite" },
                ],
                placeholder: "All Locations",
              },
              sort: {
                options: [
                  { label: "Highest Match", value: "score" },
                  { label: "Most Recent",   value: "date" },
                ],
                placeholder: "Sort by Match",
              },
            }}
          />
        ) : (
          <div className="search-bar">
            <Search size={14} />
            <span>Search jobs, companies…</span>
            <kbd>⌘K</kbd>
          </div>
        )}
      </div>

      {/* Right — actions */}
      <div className="topbar-right">
        {isJobs && (
          <InteractiveHoverButton
            disabled={matching}
            onClick={handleFindMatches}
            className={matching ? "opacity-60 cursor-not-allowed" : ""}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {matching ? "Finding…" : "Find New Matches"}
            </span>
          </InteractiveHoverButton>
        )}
        <button className="icon-btn" aria-label="Notifications" type="button">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
