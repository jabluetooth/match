"use client";

import { useMemo, useState } from "react";
import { Briefcase, ExternalLink, MapPin, Search, X } from "lucide-react";
import { ApplicationRowActions } from "@/components/application-actions";

interface ApplicationListItem {
  id: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  appliedAt: Date | null;
  job: {
    id: number;
    title: string;
    companyName: string;
    location: string | null;
    sourceUrl: string;
  };
}

interface ApplicationsListProps {
  applications: ApplicationListItem[];
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  interested: "Interested",
  applied: "Applied",
  submitted: "Applied",
  phone_screen: "Phone screen",
  screening: "Phone screen",
  interview: "Interview",
  final_round: "Final round",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  accepted: "Accepted",
};

const STATUS_CSS: Record<string, string> = {
  draft: "draft",
  interested: "interested",
  applied: "applied",
  submitted: "applied",
  phone_screen: "phone_screen",
  screening: "phone_screen",
  interview: "interview",
  final_round: "interview",
  offer: "offer",
  rejected: "rejected",
  withdrawn: "rejected",
  accepted: "accepted",
};

const STATUS_BUCKETS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active", match: (s: string) => !["rejected", "withdrawn", "accepted"].includes(s) },
  { key: "interview", label: "Interviewing", match: (s: string) => ["phone_screen", "screening", "interview", "final_round"].includes(s) },
  { key: "offer", label: "Offers", match: (s: string) => ["offer", "accepted"].includes(s) },
  { key: "closed", label: "Closed", match: (s: string) => ["rejected", "withdrawn"].includes(s) },
] as const;

function formatRelative(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function ApplicationsList({ applications }: ApplicationsListProps) {
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState<(typeof STATUS_BUCKETS)[number]["key"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((app) => {
      if (q && !app.job.title.toLowerCase().includes(q) && !app.job.companyName.toLowerCase().includes(q)) {
        return false;
      }
      const def = STATUS_BUCKETS.find((b) => b.key === bucket);
      if (def && "match" in def && def.match && !def.match(app.status)) return false;
      return true;
    });
  }, [applications, query, bucket]);

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: applications.length };
    for (const def of STATUS_BUCKETS) {
      if ("match" in def && def.match) {
        out[def.key] = applications.filter((a) => def.match!(a.status)).length;
      }
    }
    return out;
  }, [applications]);

  return (
    <>
      {/* Filter / search row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <label
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            flex: "1 1 280px",
            minWidth: 240,
            height: 40,
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 12,
            boxShadow: "var(--shadow-card)",
            paddingInline: "12px 8px",
          }}
        >
          <Search size={14} style={{ color: "var(--ink-3)", flexShrink: 0 }} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by company or role…"
            aria-label="Filter applications"
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              marginLeft: 8,
              fontSize: 13.5,
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
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              style={{
                width: 20,
                height: 20,
                display: "grid",
                placeItems: "center",
                borderRadius: 6,
                border: "none",
                background: "var(--bg-2)",
                color: "var(--ink-3)",
                cursor: "pointer",
              }}
            >
              <X size={11} />
            </button>
          )}
        </label>

        <div role="tablist" aria-label="Status filter" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {STATUS_BUCKETS.map((b) => {
            const active = bucket === b.key;
            const count = counts[b.key] ?? 0;
            return (
              <button
                key={b.key}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setBucket(b.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--primary-ink)" : "var(--ink-2)",
                  background: active ? "var(--primary-soft)" : "transparent",
                  border: `1px solid ${active ? "color-mix(in oklab, var(--accent-c) 50%, transparent)" : "var(--line)"}`,
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .12s ease, color .12s ease, border-color .12s ease",
                }}
              >
                {b.label}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    minWidth: 18,
                    padding: "1px 6px",
                    background: active ? "rgba(255,255,255,.7)" : "var(--bg-2)",
                    borderRadius: 999,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result rows */}
      {filtered.length === 0 ? (
        <EmptyState
          query={query}
          bucket={bucket}
          totalApplications={applications.length}
          onClear={() => {
            setQuery("");
            setBucket("all");
          }}
        />
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {filtered.map((app) => (
            <ApplicationRowCard key={app.id} app={app} />
          ))}
        </ul>
      )}
    </>
  );
}

function ApplicationRowCard({ app }: { app: ApplicationListItem }) {
  const label = STATUS_LABEL[app.status] ?? app.status;
  const cssBucket = STATUS_CSS[app.status] ?? "draft";
  const updated = formatRelative(app.updatedAt);

  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto",
        alignItems: "center",
        gap: 16,
        padding: "14px 18px",
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 14,
        boxShadow: "var(--shadow-card)",
        transition: "border-color .15s ease, transform .15s ease",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          background: "var(--bg-2)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          color: "var(--ink-2)",
          flexShrink: 0,
        }}
      >
        <Briefcase size={15} />
      </span>

      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {app.job.title}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 12.5,
            color: "var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span>{app.job.companyName}</span>
          {app.job.location && (
            <>
              <span aria-hidden style={{ opacity: 0.4 }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <MapPin size={11} /> {app.job.location}
              </span>
            </>
          )}
          <span aria-hidden style={{ opacity: 0.4 }}>·</span>
          <span>Updated {updated}</span>
        </p>
      </div>

      <span
        className={`app-status ${cssBucket}`}
        style={{ justifySelf: "end" }}
      >
        <span className="dot" />
        {label}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 6, justifySelf: "end" }}>
        <ApplicationRowActions applicationId={app.id} currentStatus={app.status} />
        <a
          href={app.job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${app.job.companyName} posting`}
          style={{
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            border: "1px solid var(--line)",
            borderRadius: 8,
            color: "var(--ink-3)",
            background: "#fff",
            textDecoration: "none",
          }}
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </li>
  );
}

function EmptyState({
  query,
  bucket,
  totalApplications,
  onClear,
}: {
  query: string;
  bucket: string;
  totalApplications: number;
  onClear: () => void;
}) {
  const isFiltered = query.length > 0 || bucket !== "all";
  return (
    <div
      className="card"
      style={{
        textAlign: "center",
        padding: "56px var(--pad)",
      }}
    >
      <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)" }}>
        {totalApplications === 0
          ? "No applications yet."
          : isFiltered
            ? "No applications match this filter."
            : "Nothing here."}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--ink-3)" }}>
        {totalApplications === 0
          ? "Find a role on the Jobs page and click Apply to start tracking it."
          : "Try clearing the filter or picking a different bucket."}
      </p>
      {isFiltered && (
        <button
          type="button"
          onClick={onClear}
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 14 }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
