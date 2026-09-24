"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

const LOCATION_OPTIONS = [
  { value: "", label: "All work types" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const SORT_OPTIONS = [
  { value: "", label: "Highest match" },
  { value: "score", label: "Highest match" },
  { value: "date", label: "Most recent" },
];

interface JobsSearchProps {
  /** Total result count, displayed inline. Pass from server. */
  resultCount?: number;
}

export function JobsSearch({ resultCount }: JobsSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const location = searchParams.get("location") ?? "";
  const sort = searchParams.get("sort") ?? "";

  // Keep input in sync if URL changes via back/forward
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const pushParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      const qs = params.toString();
      router.replace(qs ? `/jobs?${qs}` : "/jobs");
    },
    [router],
  );

  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParam("q", v), 250);
  };

  const handleClearQuery = () => {
    setQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushParam("q", "");
  };

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (location) {
      const opt = LOCATION_OPTIONS.find((o) => o.value === location);
      chips.push({ key: "location", label: opt?.label ?? location, clear: () => pushParam("location", "") });
    }
    if (sort && sort !== "score") {
      const opt = SORT_OPTIONS.find((o) => o.value === sort);
      chips.push({ key: "sort", label: opt?.label ?? sort, clear: () => pushParam("sort", "") });
    }
    return chips;
  }, [location, sort, pushParam]);

  const clearAll = () => {
    setQuery("");
    router.replace("/jobs");
  };

  const hasActive = activeFilters.length > 0 || query.length > 0;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex h-10 min-w-0 flex-1 items-center rounded border border-line bg-raised px-3 transition-colors focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20 hover:border-line-strong">
          <Search size={15} className="shrink-0 text-ink-3" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by role or company"
            aria-label="Search jobs"
            enterKeyHint="search"
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              aria-label="Clear search"
              className="grid size-6 shrink-0 place-items-center rounded text-ink-3 hover:bg-surface hover:text-ink"
            >
              <X size={12} aria-hidden="true" />
            </button>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            label="Work type"
            id="worktype"
            value={location}
            options={LOCATION_OPTIONS.map((o) => (o.value === "" ? { ...o, label: "All" } : o))}
            onChange={(v) => pushParam("location", v)}
          />
          <Segmented
            label="Sort"
            id="sort"
            value={sort === "score" ? "" : sort}
            options={[
              { value: "", label: "Best fit" },
              { value: "date", label: "Newest" },
            ]}
            onChange={(v) => pushParam("sort", v)}
          />
        </div>
      </div>

      <div className="flex min-h-[22px] flex-wrap items-center gap-2 font-mono text-[11px] text-ink-3">
        {resultCount != null && (
          <span>
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </span>
        )}
        {activeFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={f.clear}
            aria-label={`Remove filter ${f.label}`}
            className="inline-flex h-6 items-center gap-1.5 rounded border border-accent/30 bg-accent/10 px-2 text-accent-ink hover:border-accent/60"
          >
            {f.label}
            <X size={10} aria-hidden="true" />
          </button>
        ))}
        {hasActive && (
          <button type="button" onClick={clearAll} className="underline decoration-line-strong underline-offset-4 hover:text-ink">
            clear all
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * A segmented control instead of a dropdown: three or four options fit on
 * screen, so there's nothing to hide behind a click. Arrow keys move
 * between options, as in a native radio group.
 */
function Segmented({
  label,
  id,
  value,
  options,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === value);
    const next = options[(i + (e.key === "ArrowRight" ? 1 : options.length - 1)) % options.length];
    onChange(next.value);
  };

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="flex h-10 items-center gap-0.5 rounded border border-line bg-surface p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value || "all"}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={
              "relative h-full rounded-[4px] px-3 text-xs transition-colors " +
              (active ? "text-ink" : "text-ink-3 hover:text-ink-2")
            }
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-[4px] border border-line-strong bg-raised"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
