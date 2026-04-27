import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { JobMatchCard } from '@/components/job-match-card';
import { FindMatchesButton } from '@/components/find-matches-button';
import { Clock } from 'lucide-react';

export const revalidate = 60;

async function getJobMatches(userId: string) {
  const matches = await prisma.jobMatch.findMany({
    where: { userId, status: 'pending' },
    orderBy: { matchScore: 'desc' },
  });

  if (matches.length === 0) return [];

  const jobIds = matches.map(m => m.jobId).filter(Boolean) as number[];
  const jobs = await prisma.job.findMany({ where: { id: { in: jobIds } } });
  const jobMap = new Map(jobs.map(j => [j.id, j]));

  return matches
    .map(m => ({
      id: m.id,
      userId: m.userId ?? userId,
      matchScore: Number(m.matchScore ?? 0),
      aiReasoning: m.aiReasoning ?? null,
      skillsMatched: m.skillsMatched ?? [],
      skillsMissing: m.skillsMissing ?? [],
      createdAt: m.createdAt,
      job: jobMap.get(m.jobId!),
    }))
    .filter(m => m.job != null) as Array<{
      id: number;
      userId: string;
      matchScore: number;
      aiReasoning: string | null;
      skillsMatched: string[];
      skillsMissing: string[];
      createdAt: Date;
      job: NonNullable<ReturnType<typeof jobMap.get>>;
    }>;
}

export default async function JobMatchesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const matches = await getJobMatches(userId);

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <h1>New <em>opportunities</em></h1>
          <p>{matches.length} role{matches.length === 1 ? '' : 's'} match your profile · sorted by fit</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FindMatchesButton />
          <div className="chip">
            <Clock size={13} />
            Last scan · just now
          </div>
        </div>
      </div>

      <div className="grid-2">
        {matches.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px var(--pad)' }}>
            <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
              No matches yet — use <strong>Find New Matches</strong> to get started.
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <JobMatchCard key={match.id} match={match} />
          ))
        )}
      </div>
    </div>
  );
}
