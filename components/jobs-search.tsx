"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown } from "lucide-react";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {/* Search input */}
        <label
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            flex: "1 1 320px",
            minWidth: 240,
            height: 44,
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 12,
            boxShadow: "var(--shadow-card)",
            paddingInline: "14px 12px",
            transition: "border-color .15s ease, box-shadow .15s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-c)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,.15), var(--shadow-card)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--line)";
            e.currentTarget.style.boxShadow = "var(--shadow-card)";
          }}
        >
          <Search size={16} style={{ color: "var(--ink-3)", flexShrink: 0 }} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search jobs, companies, skills…"
            aria-label="Search jobs"
            enterKeyHint="search"
            autoComplete="off"
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              marginLeft: 10,
              fontSize: 14,
              color: "var(--ink)",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              aria-label="Clear search"
              style={{
                width: 22,
                height: 22,
                display: "grid",
                placeItems: "center",
                borderRadius: 6,
                border: "none",
                background: "var(--bg-2)",
                color: "var(--ink-3)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={12} />
            </button>
          )}
        </label>

        {/* Filter pills */}
        <FilterPill
          label={LOCATION_OPTIONS.find((o) => o.value === location)?.label ?? "All work types"}
          active={!!location}
          value={location}
          options={LOCATION_OPTIONS}
          onChange={(v) => pushParam("location", v)}
        />
        <FilterPill
          label={sort && sort !== "score" ? (SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort") : "Highest match"}
          active={!!sort && sort !== "score"}
          value={sort}
          options={SORT_OPTIONS}
          onChange={(v) => pushParam("sort", v)}
        />
      </div>

      {/* Active filter chips + result count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          minHeight: 22,
          fontSize: 12,
        }}
      >
        {resultCount != null && (
          <span style={{ color: "var(--ink-3)" }}>
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </span>
        )}

        {activeFilters.length > 0 && resultCount != null && (
          <span aria-hidden style={{ color: "var(--ink-3)", opacity: 0.5 }}>·</span>
        )}

        {activeFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={f.clear}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 6px 3px 10px",
              fontSize: 11.5,
              fontWeight: 500,
              color: "var(--primary-ink)",
              background: "var(--primary-soft)",
              border: "1px solid color-mix(in oklab, var(--accent-c) 50%, transparent)",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {f.label}
            <span
              aria-hidden
              style={{
                display: "grid",
                placeItems: "center",
                width: 16,
                height: 16,
                borderRadius: 8,
                background: "rgba(255,255,255,.7)",
              }}
            >
              <X size={10} />
            </span>
          </button>
        ))}

        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              padding: "3px 8px",
              fontSize: 11.5,
              color: "var(--ink-2)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "underline",
            }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  value,
  options,
  onChange,
}: {
  label: string;
  active: boolean;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        height: 44,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px 0 14px",
        background: active ? "var(--primary-soft)" : "#fff",
        border: `1px solid ${active ? "color-mix(in oklab, var(--accent-c) 50%, transparent)" : "var(--line)"}`,
        color: active ? "var(--primary-ink)" : "var(--ink-2)",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "var(--shadow-card)",
        cursor: "pointer",
      }}
    >
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      <ChevronDown size={14} style={{ opacity: 0.6 }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          fontSize: 14,
          fontFamily: "inherit",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
