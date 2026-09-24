"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JobMatchCard } from "@/components/job-match-card";

interface JobMatch {
  id: number;
  userId: string;
  matchScore: number;
  aiReasoning: string | null;
  skillsMatched: string[];
  skillsMissing: string[];
  createdAt: Date;
  hasResume: boolean;
  job: {
    id: number;
    title: string;
    companyName: string;
    location: string | null;
    sourceUrl: string;
    description: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    workType: string | null;
  };
}

interface JobMatchesPagedProps {
  matches: JobMatch[];
  pageSize?: number;
}

/**
 * Renders all job matches across multiple pages, with the active page sliding
 * into view on Next/Prev. Uses CSS transforms (`translateX`) for the animation
 * so React doesn't re-mount cards between pages — keeps any in-flight async
 * work on individual cards intact.
 */
export function JobMatchesPaged({ matches, pageSize = 8 }: JobMatchesPagedProps) {
  const [page, setPage] = useState(0);

  const pages = useMemo(() => {
    const out: JobMatch[][] = [];
    for (let i = 0; i < matches.length; i += pageSize) {
      out.push(matches.slice(i, i + pageSize));
    }
    return out.length > 0 ? out : [[]];
  }, [matches, pageSize]);

  const totalPages = pages.length;
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const end = Math.min(start + pageSize, matches.length);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div>
      {/* Every page carries the same right gutter; the negative margin pulls
          it past the column edge so cards line up with the rest of the page. */}
      <div className="relative -mr-6 overflow-hidden">
        <div
          className="flex transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none"
          style={{
            width: `${totalPages * 100}%`,
            transform: `translateX(-${(safePage * 100) / totalPages}%)`,
          }}
        >
          {pages.map((slice, idx) => (
            <div
              key={idx}
              className="shrink-0 pr-6"
              style={{
                width: `${100 / totalPages}%`,
                /* hide non-active pages from the a11y tree to prevent off-screen tab traps */
                visibility: idx === safePage ? "visible" : "hidden",
              }}
              aria-hidden={idx !== safePage}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {slice.map((match) => (
                  <JobMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Job matches pagination" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="font-mono text-xs text-ink-3">
            <span className="text-ink">
              {pad(start + 1)}–{pad(end)}
            </span>{" "}
            / {pad(matches.length)}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Previous page"
              className="btn btn-quiet btn-sm px-2"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const active = idx === safePage;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPage(idx)}
                  aria-current={active ? "page" : undefined}
                  aria-label={`Page ${idx + 1}`}
                  className={
                    "grid size-8 place-items-center rounded font-mono text-xs transition-colors " +
                    (active ? "border border-accent/50 bg-accent/10 text-accent-ink" : "text-ink-3 hover:bg-raised hover:text-ink")
                  }
                >
                  {idx + 1}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              aria-label="Next page"
              className="btn btn-quiet btn-sm px-2"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
