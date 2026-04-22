"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { GooeySelect } from "@/components/ui/gooey-select";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface JobMatchFiltersProps {
  userId: string;
}

export function JobMatchFilters({ userId }: JobMatchFiltersProps) {
  const [matching, setMatching] = useState(false);

  const handleFindMatches = async () => {
    setMatching(true);
    try {
      const response = await fetch("/api/match/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to trigger job matching");

      alert("Job matching started! New matches will appear shortly.");
      window.location.reload();
    } catch (error) {
      console.error("Failed to trigger job matching:", error);
      alert("Failed to start job matching. Please try again.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <GooeySelect containerClassName="w-44">
        <option value="">All Locations</option>
        <option value="remote">Remote</option>
        <option value="hybrid">Hybrid</option>
        <option value="onsite">On-site</option>
      </GooeySelect>

      <GooeySelect containerClassName="w-44">
        <option value="">Sort by Match</option>
        <option value="score">Highest Match</option>
        <option value="date">Most Recent</option>
      </GooeySelect>

      <div className="ml-auto">
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
    </div>
  );
}
