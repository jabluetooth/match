"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { GooeyInput } from "@/components/ui/gooey-input";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isJobs = pathname === "/jobs";

  // Keep a ref so debounced callbacks always read the latest searchParams
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/jobs?${params.toString()}`);
  }, [router]);

  // Text search: debounced — avoids a server roundtrip on every keystroke
  const updateParamDebounced = useCallback((key: string, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParam(key, value), 300);
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
            value={searchParams.get("q") ?? ""}
            onValueChange={(v) => updateParamDebounced("q", v)}
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
