"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowUpRight, Briefcase } from "lucide-react";

interface Match {
  id: number;
  matchScore: number;
  job: {
    id: number;
    title: string;
    companyName: string;
    location: string | null;
    sourceUrl: string;
  };
  createdAt: Date;
}

interface RecentMatchesProps {
  matches: Match[];
}

export function RecentMatches({ matches }: RecentMatchesProps) {
  return (
    <div
      className="rounded-2xl bg-white border shadow-sm overflow-hidden"
      style={{ borderColor: '#e2e3e4' }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: '#e2e3e4' }}
      >
        <div>
          <h2 className="text-sm font-bold" style={{ color: '#080101' }}>
            My matches
          </h2>
        </div>
        <Briefcase className="h-4 w-4" style={{ color: '#473e3b' }} />
      </div>

      <div className="divide-y" style={{ borderColor: '#e2e3e4' }}>
        {matches.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={{ color: '#473e3b' }}>
              No matches yet. Check back soon!
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="px-5 py-3 flex items-center gap-3 group transition-colors hover:bg-[#fcfcff]"
            >
              {/* Date / time pill */}
              <div className="shrink-0 w-14 text-right">
                <p className="text-[10px] leading-tight font-medium" style={{ color: '#473e3b' }}>
                  {formatRelativeTime(match.createdAt)}
                </p>
              </div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#080101' }}>
                  {match.job.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] truncate" style={{ color: '#473e3b' }}>
                    {match.job.companyName}
                  </span>
                  {match.job.location && (
                    <span className="text-[10px] shrink-0" style={{ color: '#e2e3e4' }}>
                      · {match.job.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Match % + external link */}
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-sm font-bold" style={{ color: '#1877f2' }}>
                  {Math.round(Number(match.matchScore))}%
                </span>
                <a
                  href={match.job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Open job posting"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" style={{ color: '#1877f2' }} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {matches.length > 0 && (
        <div
          className="px-5 py-3 border-t"
          style={{ borderColor: '#e2e3e4' }}
        >
          <Link
            href="/jobs"
            className="text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#1877f2' }}
          >
            See all matches →
          </Link>
        </div>
      )}
    </div>
  );
}
