"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function FindMatchesButton() {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/match/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Match started", "New job matches will appear shortly.");
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
