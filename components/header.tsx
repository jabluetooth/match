"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200/80 bg-white/80 px-6 backdrop-blur-md">

      {/* Left — brand */}
      <span
        className="shrink-0 select-none text-2xl font-black text-gray-900"
        style={{ fontFamily: "var(--font-outfit), 'Inter', sans-serif", letterSpacing: "-0.04em" }}
      >
        match
      </span>

      {isJobs ? (
        <>
          {/* Middle — search + filters (jobs page only) */}
          <div className="flex flex-1 items-center justify-center overflow-visible">
            <GooeyInput
              placeholder="Search jobs, companies..."
              collapsedWidth={150}
              expandedWidth={520}
              expandedOffset={48}
              gooeyBlur={5}
              filters={{
                location: {
                  options: [
                    { label: "Remote", value: "remote" },
                    { label: "Hybrid", value: "hybrid" },
                    { label: "On-site", value: "onsite" },
                  ],
                  placeholder: "All Locations",
                },
                sort: {
                  options: [
                    { label: "Highest Match", value: "score" },
                    { label: "Most Recent", value: "date" },
                  ],
                  placeholder: "Sort by Match",
                },
              }}
            />
          </div>

          {/* Right — button (jobs page only) */}
          <div className="flex shrink-0 items-center gap-2">
            <InteractiveHoverButton
              disabled={matching}
              onClick={handleFindMatches}
              className={matching ? "opacity-60 cursor-not-allowed" : ""}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {matching ? "Finding..." : "Find New Matches"}
              </span>
            </InteractiveHoverButton>
          </div>
        </>
      ) : (
        /* Non-jobs pages: empty flex spacer */
        <div className="flex-1" />
      )}
    </header>
  );
}
