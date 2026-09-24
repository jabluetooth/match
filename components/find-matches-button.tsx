"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { useMatchScan } from "@/hooks/use-match-scan";

/**
 * Starts a matching run. The run itself (pre-flight, trigger, polling)
 * lives in hooks/use-match-scan.ts; progress shows in <ScanProgress />.
 */
export function FindMatchesButton() {
  const { userId } = useAuth();
  const router = useRouter();
  const phase = useMatchScan((s) => s.phase);
  const start = useMatchScan((s) => s.start);
  const busy = phase === "checking" || phase === "queued" || phase === "scoring";

  return (
    <button
      onClick={() => userId && start(userId, () => router.refresh())}
      disabled={busy || !userId}
      className="btn btn-primary"
      type="button"
      aria-busy={busy}
    >
      {busy ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <Sparkles size={13} aria-hidden="true" />}
      {busy ? "Scanning…" : "Find new matches"}
    </button>
  );
}
