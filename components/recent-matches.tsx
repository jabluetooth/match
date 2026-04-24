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
    <div className="card g-matches" style={{ padding: 0 }}>
      <div className="card-head" style={{ padding: 'var(--pad)', paddingBottom: 0, marginBottom: 0 }}>
        <div>
          <p className="card-title">Latest</p>
          <p className="card-lead">My matches</p>
        </div>
        <div className="tile-ico" style={{ background: 'var(--bg-2)', backdropFilter: 'none', border: '1px solid var(--line)' }}>
          <Briefcase size={15} color="var(--ink-3)" />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {matches.length === 0 ? (
          <div style={{ padding: '24px var(--pad)', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
            No matches yet — check back soon!
          </div>
        ) : (
          matches.map((match) => (
            <a
              key={match.id}
              href={match.job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="match-row"
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {match.job.title}
                </p>
                <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {match.job.companyName}{match.job.location ? ` · ${match.job.location}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                  {Math.round(Number(match.matchScore))}%
                </span>
                <ArrowUpRight size={13} color="var(--ink-3)" />
              </div>
            </a>
          ))
        )}
      </div>

      {matches.length > 0 && (
        <div style={{ padding: '12px var(--pad)', borderTop: '1px solid var(--line)' }}>
          <Link href="/jobs" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
            See all matches →
          </Link>
        </div>
      )}
    </div>
  );
}
