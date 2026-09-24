"use client";

import { create } from "zustand";
import { toast } from "@/hooks/use-toast";
import { formatAge } from "@/lib/utils";

/**
 * One "Find new matches" run, shared by the button and the progress panel.
 *
 * The state lives in a module-level store rather than in a component, so a
 * scan keeps polling when you navigate away from /jobs and the panel picks
 * it back up when you return.
 *
 * Progress is real, not simulated: n8n's matching loop scores up to
 * SCAN_BATCH jobs per run (`LIMIT 10` in the "Get Unscored Jobs" node of
 * Match.json) and inserts one job_matches row per job as it goes, so the
 * growth in the user's total match count is the number scored so far.
 */

const POLL_INTERVAL_MS = 3_000;
const POLL_DEADLINE_MS = 180_000; // n8n's loop includes rate-limit waits
// After the first row lands, stop if nothing new arrives for this long:
// n8n may skip a job without writing a row, so "scored == expected" alone
// could wait forever.
const QUIET_MS = 30_000;
export const SCAN_BATCH = 10;

export type ScanPhase = "idle" | "checking" | "queued" | "scoring" | "done" | "error";

interface MatchCount {
  count: number; // pending (strong) matches
  total: number; // every scored match, strong or not
  lastMatchAt: string | null;
  lastMatchScore: number | null;
}

interface TriggerResponse {
  success: boolean;
  triggered: boolean;
  reason?: "no_jobs_in_db" | "no_recent_scrape" | "all_jobs_already_matched" | "matching_in_progress" | "n8n_unreachable";
  eligible?: number;
  totalJobs?: number;
  lastScrapedAt?: string | null;
  n8n_error?: string | null;
}

interface ScanState {
  phase: ScanPhase;
  /** Jobs n8n will score this run: min(eligible, SCAN_BATCH). */
  expected: number;
  scored: number;
  strong: number;
  lastScore: number | null;
  startedAt: number | null;
  finishedAt: number | null;
  /** One-line outcome for the panel once the run ends. */
  message: string | null;
  /** The panel is dismissed; a new run shows it again. */
  hidden: boolean;
  start: (userId: string, refresh: () => void) => Promise<void>;
  dismiss: () => void;
}

async function getCount(): Promise<MatchCount | null> {
  try {
    const res = await fetch("/api/match/jobs/count", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as MatchCount;
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useMatchScan = create<ScanState>((set, get) => ({
  phase: "idle",
  expected: 0,
  scored: 0,
  strong: 0,
  lastScore: null,
  startedAt: null,
  finishedAt: null,
  message: null,
  hidden: true,

  dismiss: () => set({ hidden: true }),

  start: async (userId, refresh) => {
    const busy = ["checking", "queued", "scoring"].includes(get().phase);
    if (busy || !userId) return;

    set({
      phase: "checking",
      expected: 0,
      scored: 0,
      strong: 0,
      lastScore: null,
      startedAt: Date.now(),
      finishedAt: null,
      message: null,
      hidden: false,
    });

    const finish = (phase: "done" | "error", message: string) =>
      set({ phase, message, finishedAt: Date.now() });

    try {
      const initial = await getCount();

      const res = await fetch("/api/match/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const payload = (await res.json().catch(() => ({}))) as TriggerResponse;

      // Pre-flight said there's nothing to score.
      if (payload.triggered === false) {
        switch (payload.reason) {
          case "no_jobs_in_db":
            return finish("error", "The scraper hasn't added any jobs yet. Check the n8n schedule trigger.");
          case "no_recent_scrape":
            return finish(
              "error",
              `No fresh jobs: the last scrape ran ${formatAge(payload.lastScrapedAt ?? null)}. Re-run the scrape in n8n or wait for the next run.`,
            );
          case "all_jobs_already_matched":
            return finish(
              "done",
              `You're caught up. Every job from the last 7 days is scored (${payload.totalJobs ?? 0} in the database).`,
            );
        }
      }

      if (res.status === 429) {
        return finish("error", "Too many scans in a short time. Wait a few minutes and try again.");
      }
      if (!res.ok || payload.success === false) {
        return finish("error", payload.n8n_error || "n8n didn't accept the request. Check the instance is up.");
      }

      const expected = Math.max(1, Math.min(payload.eligible ?? SCAN_BATCH, SCAN_BATCH));
      set({ phase: "queued", expected });

      const baseTotal = initial?.total ?? 0;
      const basePending = initial?.count ?? 0;
      const deadline = Date.now() + POLL_DEADLINE_MS;
      let lastChange = Date.now();

      while (Date.now() < deadline) {
        await sleep(POLL_INTERVAL_MS);
        const now = await getCount();
        if (!now) continue;

        const scored = Math.max(0, now.total - baseTotal);
        const strong = Math.max(0, now.count - basePending);
        if (scored !== get().scored) lastChange = Date.now();
        set({
          phase: scored > 0 ? "scoring" : "queued",
          scored,
          strong,
          lastScore: scored > 0 ? now.lastMatchScore : null,
        });

        const complete = scored >= expected;
        const quiet = scored > 0 && Date.now() - lastChange > QUIET_MS;
        if (complete || quiet) break;
      }

      const { scored, strong } = get();
      refresh();

      if (scored === 0) {
        return finish(
          "error",
          "n8n hasn't reported any scores yet. It may still be running, or it found nothing to do. Check its execution log.",
        );
      }

      const msg =
        strong > 0
          ? `${strong} new match${strong === 1 ? "" : "es"} from ${scored} job${scored === 1 ? "" : "s"} scored.`
          : `${scored} job${scored === 1 ? "" : "s"} scored, none strong enough to list. Adding skills in Settings can help.`;
      finish("done", msg);

      // If the panel isn't on screen (you navigated away), say so in a toast.
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/jobs")) {
        if (strong > 0) toast.success("New matches found", msg);
        else toast.info("Scan finished", msg, 8000);
      }
    } catch (err) {
      finish("error", err instanceof Error ? err.message : "Couldn't start matching. Please try again.");
    }
  },
}));
