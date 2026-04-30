"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GooeyInput } from "@/components/ui/gooey-input";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isJobs = pathname === "/jobs";

  // Local state drives the input display so keystrokes appear instantly.
  // The URL update is debounced separately.
  const [localQ, setLocalQ] = useState(searchParams.get("q") ?? "");

  // Sync local state if the user navigates away and back to /jobs
  useEffect(() => {
    setLocalQ(searchParams.get("q") ?? "");
  }, [pathname]); // intentionally only on pathname change, not every searchParams update

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/jobs?${params.toString()}`);
  }, [router]);

  const handleSearchChange = useCallback((v: string) => {
    setLocalQ(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParam("q", v), 300);
  }, [pushParam]);

  return (
    <header className="topbar">
      <Link href="/" className="logo">match</Link>

      <div className="topbar-center">
        {isJobs && (
          <GooeyInput
            placeholder="Search jobs, companies…"
            collapsedWidth={160}
            expandedWidth={480}
            expandedOffset={48}
            gooeyBlur={5}
            value={localQ}
            onValueChange={handleSearchChange}
            filters={{
              location: {
                options: [
                  { label: "Remote",  value: "remote" },
                  { label: "Hybrid",  value: "hybrid" },
                  { label: "On-site", value: "onsite" },
                ],
                placeholder: "All Locations",
                value: searchParams.get("location") ?? "",
                onChange: (v) => pushParam("location", v),
              },
              sort: {
                options: [
                  { label: "Highest Match", value: "score" },
                  { label: "Most Recent",   value: "date" },
                ],
                placeholder: "Sort by Match",
                value: searchParams.get("sort") ?? "",
                onChange: (v) => pushParam("sort", v),
              },
            }}
          />
        )}
      </div>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications" type="button">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
