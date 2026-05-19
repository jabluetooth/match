"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const POLL_INTERVAL_MS = 5_000;
const POLL_DEADLINE_MS = 120_000;

async function getMatchCount(): Promise<number> {
  const res = await fetch("/api/match/jobs/count", { cache: "no-store" });
  if (!res.ok) return 0;
  const data = (await res.json()) as { count?: number };
  return data.count ?? 0;
}

export function FindMatchesButton() {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Snapshot the count so we can detect new matches landing.
      const initialCount = await getMatchCount();

      const res = await fetch("/api/match/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error("Failed");

      toast.info("Scanning for matches", "This usually takes 30–60 seconds.");

      // Poll for new matches to land. n8n runs async — the trigger response
      // returns before matches are committed.
      const deadline = Date.now() + POLL_DEADLINE_MS;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const current = await getMatchCount();
        if (current > initialCount) {
          const added = current - initialCount;
          toast.success("New matches found", `${added} new match${added === 1 ? "" : "es"}.`);
          router.refresh();
          return;
        }
      }

      // No new matches inside the budget — n8n might still be working. Refresh
      // so any partial results land, and let the user know it's still going.
      toast.info(
        "Still scanning",
        "No new matches yet. Try refreshing in a minute — n8n is still running.",
      );
      router.refresh();
    } catch {
      toast.error("Couldn’t start matching", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn btn-primary"
      type="button"
      style={loading ? { opacity: 0.65, cursor: "not-allowed" } : undefined}
    >
      <Sparkles size={13} />
      {loading ? "Finding…" : "Find New Matches"}
    </button>
  );
}
