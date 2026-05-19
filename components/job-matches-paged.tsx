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
export function JobMatchesPaged({ matches, pageSize = 9 }: JobMatchesPagedProps) {
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

  return (
    <div>
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${totalPages * 100}%`,
            transform: `translateX(-${(safePage * 100) / totalPages}%)`,
            transition: "transform .55s cubic-bezier(.22, 1, .36, 1)",
            willChange: "transform",
          }}
        >
          {pages.map((slice, idx) => (
            <div
              key={idx}
              style={{
                width: `${100 / totalPages}%`,
                flexShrink: 0,
                paddingRight: idx === totalPages - 1 ? 0 : "var(--gap)",
                /* hide non-active pages from a11y tree to prevent off-screen tab traps */
                visibility: idx === safePage ? "visible" : "hidden",
              }}
              aria-hidden={idx !== safePage}
            >
              <div className="grid-2">
                {slice.map((match) => (
                  <JobMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Job matches pagination"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
            Showing <span style={{ color: "var(--ink)", fontWeight: 600 }}>{start + 1}–{end}</span>{" "}
            of <span style={{ color: "var(--ink)", fontWeight: 600 }}>{matches.length}</span>
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Previous page"
              className="btn btn-ghost btn-sm"
              style={{
                padding: "8px 10px",
                opacity: safePage === 0 ? 0.4 : 1,
                cursor: safePage === 0 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={14} />
            </button>

            <div role="group" aria-label="Pages" style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const active = idx === safePage;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPage(idx)}
                    aria-current={active ? "page" : undefined}
                    aria-label={`Page ${idx + 1}`}
                    style={{
                      width: active ? 28 : 8,
                      height: 8,
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      background: active ? "var(--accent-strong)" : "rgba(255, 255, 255, 0.18)",
                      transition: "width .25s ease, background .12s ease",
                      padding: 0,
                    }}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              aria-label="Next page"
              className="btn btn-ghost btn-sm"
              style={{
                padding: "8px 10px",
                opacity: safePage === totalPages - 1 ? 0.4 : 1,
                cursor: safePage === totalPages - 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
