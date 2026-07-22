"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatAge } from "@/lib/utils";

const POLL_INTERVAL_MS = 4_000;
const POLL_DEADLINE_MS = 150_000; // 2.5 min — n8n's match-job loop with rate-limit waits

interface MatchCount {
  count: number;            // pending matches
  total: number;            // all matches (pending + rejected)
  lastMatchAt: string | null;
  lastScrapedAt: string | null;
  jobsLast24h: number;
  totalJobs: number;
  unmatchedJobs: number;
}

interface TriggerResponse {
  success: boolean;
  triggered: boolean;
  reason?:
    | "no_jobs_in_db"
    | "no_recent_scrape"
    | "all_jobs_already_matched"
    | "matching_in_progress"
    | "n8n_unreachable";
  eligible?: number;
  jobsLast24h?: number;
  totalJobs?: number;
  lastScrapedAt?: string | null;
  n8n_error?: string | null;
}

async function getCount(): Promise<MatchCount | null> {
  const res = await fetch("/api/match/jobs/count", { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as MatchCount;
}

export function FindMatchesButton() {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const initial = await getCount();

      const res = await fetch("/api/match/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      // Server returns a structured payload even on 200; surface it directly.
      const payload = (await res.json().catch(() => ({}))) as TriggerResponse;

      // Pre-flight told us not to bother triggering n8n.
      if (payload.triggered === false) {
        switch (payload.reason) {
          case "no_jobs_in_db":
            toast.error(
              "No jobs to match",
              "The scraper hasn't populated any jobs yet. Check the n8n schedule trigger.",
              9000,
            );
            return;
          case "no_recent_scrape":
            toast.error(
              "No fresh jobs",
              `Last scrape ran ${formatAge(payload.lastScrapedAt ?? null)}. Re-run the scrape workflow in n8n or wait for tomorrow's run.`,
              9000,
            );
            return;
          case "all_jobs_already_matched":
            toast.info(
              "You're caught up",
              `Every job in the last 7 days has been scored. ${payload.totalJobs ?? 0} total in DB. New matches will appear after the next scrape.`,
              8000,
            );
            return;
        }
      }

      // n8n was unreachable / errored.
      if (!res.ok || payload.success === false) {
        toast.error(
          "Couldn't reach n8n",
          payload.n8n_error || "The matching workflow didn't accept the request. Check the n8n instance is up.",
          9000,
        );
        return;
      }

      toast.info(
        "Scoring matches",
        `${payload.eligible ?? "?"} job${payload.eligible === 1 ? "" : "s"} queued. AI scoring usually takes 30–90 seconds.`,
      );

      // Poll for completion. Watch BOTH pending count AND total — that way we
      // detect when n8n finished even if every job was rejected (<70 score).
      const deadline = Date.now() + POLL_DEADLINE_MS;
      const initialPending = initial?.count ?? 0;
      const initialTotal = initial?.total ?? 0;
      const initialLastMatchAt = initial?.lastMatchAt;

      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const current = await getCount();
        if (!current) continue;

        const pendingGrew = current.count > initialPending;
        const totalGrew = current.total > initialTotal;
        const lastMatchChanged =
          current.lastMatchAt &&
          current.lastMatchAt !== initialLastMatchAt;

        if (pendingGrew) {
          const added = current.count - initialPending;
          toast.success("New matches found", `${added} new match${added === 1 ? "" : "es"} added.`);
          router.refresh();
          return;
        }

        if (totalGrew || lastMatchChanged) {
          // n8n finished, but nothing crossed the score threshold.
          const rejected = current.total - initialTotal;
          toast.info(
            "Scoring finished — no strong matches",
            `${rejected || "Some"} job${rejected === 1 ? "" : "s"} scored but none reached the match threshold. Try adjusting skills in Settings.`,
            8000,
          );
          router.refresh();
          return;
        }
      }

      // Hit the deadline without seeing any DB change.
      const final = await getCount();
      if (final && final.total > initialTotal) {
        // Race we just missed.
        toast.success("Matches updated", "Refresh to see the latest scores.");
        router.refresh();
        return;
      }

      toast.info(
        "No update yet",
        "n8n hasn't reported any new or scored matches. It may still be running, or it may have found nothing to do — check the execution log in n8n to see what happened.",
        9000,
      );
      router.refresh();
    } catch (err) {
      toast.error(
        "Couldn't start matching",
        err instanceof Error ? err.message : "Please try again.",
      );
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
      {loading ? <Loader2 size={13} className="btn-spinner" /> : <Sparkles size={13} />}
      {loading ? "Finding…" : "Find New Matches"}
    </button>
  );
}
