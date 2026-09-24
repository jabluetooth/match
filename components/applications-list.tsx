"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, ExternalLink, MapPin, Search, SearchX, X } from "lucide-react";
import { ApplicationRowActions } from "@/components/application-actions";
import { EmptyState } from "@/components/system/empty-state";
import { StatusPill } from "@/components/system/status-pill";
import { StageTicks } from "@/components/system/stage-rail";
import { statusMeta } from "@/lib/status";
import { safeExternalUrl } from "@/lib/utils";

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

const STATUS_BUCKETS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active", match: (s: string) => !["rejected", "withdrawn", "accepted"].includes(s) },
  { key: "interview", label: "Interviewing", match: (s: string) => ["phone_screen", "screening", "interview", "final_round"].includes(s) },
  { key: "offer", label: "Offers", match: (s: string) => ["offer", "accepted"].includes(s) },
  { key: "closed", label: "Closed", match: (s: string) => ["rejected", "withdrawn"].includes(s) },
] as const;

type BucketKey = (typeof STATUS_BUCKETS)[number]["key"];

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
  const [bucket, setBucket] = useState<BucketKey>("all");

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

  const isFiltered = query.length > 0 || bucket !== "all";

  return (
    <section aria-label="Applications">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Underlined tabs, Linear-style, with the count in mono. */}
        <div role="tablist" aria-label="Status filter" className="-mb-px flex gap-1 overflow-x-auto border-b border-line">
          {STATUS_BUCKETS.map((b) => {
            const active = bucket === b.key;
            return (
              <button
                key={b.key}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setBucket(b.key)}
                className={
                  "relative flex h-10 shrink-0 items-center gap-2 px-3 text-[13px] transition-colors " +
                  (active ? "text-ink" : "text-ink-3 hover:text-ink-2")
                }
              >
                {b.label}
                <span className="font-mono text-[11px] text-ink-3">{counts[b.key] ?? 0}</span>
                {active && (
                  <motion.span
                    layoutId="app-tab"
                    className="absolute inset-x-2 -bottom-px h-0.5 bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <label className="flex h-9 items-center rounded border border-line bg-raised px-3 transition-colors focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20 lg:w-72">
          <Search size={14} className="shrink-0 text-ink-3" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by company or role"
            aria-label="Filter applications"
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="grid size-5 place-items-center rounded text-ink-3 hover:text-ink"
            >
              <X size={11} aria-hidden="true" />
            </button>
          )}
        </label>
      </div>

      {filtered.length === 0 ? (
        applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            body="Find a role on the Job matches page and press Apply to start tracking it."
            action={
              <Link href="/jobs" className="btn btn-primary">
                Browse matches
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title="Nothing here"
            body={isFiltered ? "No application matches this filter." : "No applications."}
            action={
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setQuery("");
                  setBucket("all");
                }}
              >
                Clear filters
              </button>
            }
          />
        )
      ) : (
        <div className="panel overflow-hidden">
          {/* Column header, desktop only. */}
          <div className="hidden grid-cols-[minmax(0,1fr)_88px_140px_150px_32px] items-center gap-4 border-b border-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 md:grid">
            <span>Role</span>
            <span>Progress</span>
            <span>Status</span>
            <span>Move to</span>
            <span className="sr-only">Posting</span>
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((app) => (
              <ApplicationRow key={app.id} app={app} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ApplicationRow({ app }: { app: ApplicationListItem }) {
  const meta = statusMeta(app.status);
  const sourceUrl = safeExternalUrl(app.job.sourceUrl);

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-raised/40 md:grid-cols-[minmax(0,1fr)_88px_140px_150px_32px]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{app.job.title}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-2 truncate text-xs text-ink-3">
          <span className="truncate text-ink-2">{app.job.companyName}</span>
          {app.job.location && (
            <span className="hidden items-center gap-1 sm:inline-flex">
              <MapPin size={11} aria-hidden="true" />
              {app.job.location}
            </span>
          )}
          <span className="shrink-0 font-mono text-[11px]">· {formatRelative(app.updatedAt)}</span>
        </p>
      </div>
      <StageTicks reached={meta.stage} closed={meta.closed} className="hidden md:inline-flex" />
      <div>
        <StatusPill status={app.status} />
      </div>
      <div className="col-span-2 flex items-center gap-2 md:col-span-1">
        <ApplicationRowActions applicationId={app.id} currentStatus={app.status} />
      </div>
      <div className="hidden md:block">
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${app.job.companyName} posting`}
            className="grid size-8 place-items-center rounded text-ink-3 hover:bg-raised hover:text-ink"
          >
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
      </div>
    </li>
  );
}
