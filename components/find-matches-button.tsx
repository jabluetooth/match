"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export function FindMatchesButton() {
  const { userId } = useAuth();
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
      alert("Job matching started! New matches will appear shortly.");
      window.location.reload();
    } catch {
      alert("Failed to start job matching. Please try again.");
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
