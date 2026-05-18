"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { GooeyInput } from "@/components/ui/gooey-input";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { toast } from "@/hooks/use-toast";

interface JobMatchFiltersProps {
  userId: string;
}

const LOCATION_OPTIONS = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];

const SORT_OPTIONS = [
  { label: "Highest Match", value: "score" },
  { label: "Most Recent", value: "date" },
];

export function JobMatchFilters({ userId }: JobMatchFiltersProps) {
  const router = useRouter();
  const [matching, setMatching] = useState(false);
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");

  const handleFindMatches = async () => {
    setMatching(true);
    try {
      const response = await fetch("/api/match/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to trigger job matching");

      toast.success("Match started", "New job matches will appear shortly.");
      router.refresh();
    } catch (error) {
      console.error("Failed to trigger job matching:", error);
      toast.error("Couldn’t start matching", "Please try again.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <GooeyInput
        collapsedWidth={110}
        expandedWidth={340}
        expandedOffset={50}
        filters={{
          location: {
            options: LOCATION_OPTIONS,
            value: location,
            onChange: setLocation,
            placeholder: "All Locations",
          },
          sort: {
            options: SORT_OPTIONS,
            value: sort,
            onChange: setSort,
            placeholder: "Sort by Match",
          },
        }}
      />

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
