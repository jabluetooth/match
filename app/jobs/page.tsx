import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { JobMatchCard } from '@/components/job-match-card';
import { FindMatchesButton } from '@/components/find-matches-button';
import { Clock } from 'lucide-react';

export const revalidate = 60;

async function getJobMatches(userId: string, q: string, location: string, sort: string) {
  const matches = await prisma.jobMatch.findMany({
    where: { userId, status: 'pending' },
    orderBy: sort === 'date' ? { createdAt: 'desc' } : { matchScore: 'desc' },
  });

  if (matches.length === 0) return [];

  const jobIds = matches.map(m => m.jobId).filter(Boolean) as number[];

  const [jobs, tailoredResumes] = await Promise.all([
    prisma.job.findMany({ where: { id: { in: jobIds } } }),
    prisma.tailoredResume.findMany({
      where: { userId, jobId: { in: jobIds } },
      select: { jobId: true },
    }),
  ]);

  const jobMap = new Map(jobs.map(j => [j.id, j]));
  const resumeSet = new Set(tailoredResumes.map(r => r.jobId));

  const ql = q.toLowerCase();
  const locFilter = location.toLowerCase();

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
      hasResume: resumeSet.has(m.jobId!),
    }))
    .filter(m => m.job != null)
    .filter(m => {
      if (ql && !m.job!.title.toLowerCase().includes(ql) && !m.job!.companyName.toLowerCase().includes(ql)) return false;
      if (locFilter && m.job!.workType?.toLowerCase() !== locFilter) return false;
      return true;
    }) as Array<{
      id: number;
      userId: string;
      matchScore: number;
      aiReasoning: string | null;
      skillsMatched: string[];
      skillsMissing: string[];
      createdAt: Date;
      hasResume: boolean;
      job: NonNullable<ReturnType<typeof jobMap.get>>;
    }>;
}

export default async function JobMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; sort?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { q = '', location = '', sort = '' } = await searchParams;
  const matches = await getJobMatches(userId, q, location, sort);

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
