"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GooeyInput } from "@/components/ui/gooey-input";

export function Header() {
  const pathname = usePathname();
  const isJobs = pathname === "/jobs";

  return (
    <header className="topbar">
      {/* Left — logo */}
      <Link href="/" className="logo">
        match
      </Link>

      {/* Center — search (jobs only) */}
      <div className="topbar-center">
        {isJobs && (
          <GooeyInput
            placeholder="Search jobs, companies…"
            collapsedWidth={160}
            expandedWidth={480}
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
        )}
      </div>

      {/* Right — icon actions */}
      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications" type="button">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
