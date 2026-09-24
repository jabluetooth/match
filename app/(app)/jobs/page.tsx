import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { JobMatchesPaged } from '@/components/job-matches-paged';
import { FindMatchesButton } from '@/components/find-matches-button';
import { JobsSearch } from '@/components/jobs-search';
import { Clock, SearchX, Target } from 'lucide-react';
import { PageHead } from '@/components/system/page-head';
import { EmptyState } from '@/components/system/empty-state';
import { formatAge } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Job matches' };

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
  const [matches, lastScrapedJob] = await Promise.all([
    getJobMatches(userId, q, location, sort),
    prisma.job.findFirst({
      where: { status: 'active' },
      orderBy: { scrapedAt: 'desc' },
      select: { scrapedAt: true },
    }),
  ]);

  const filtered = Boolean(q || location || sort);

  return (
    <>
      <PageHead
        kicker="02 · job matches"
        title={<>New <em>opportunities</em></>}
        lead={
          <>
            {matches.length} role{matches.length === 1 ? '' : 's'} scored against your profile
            <span className="mx-2 text-line-strong" aria-hidden="true">/</span>
            <span className="font-mono text-xs text-ink-3">
              <Clock size={11} className="-mt-0.5 mr-1 inline" aria-hidden="true" />
              last scan {formatAge(lastScrapedJob?.scrapedAt ?? null)}
            </span>
          </>
        }
        actions={<FindMatchesButton />}
      />

      <Suspense fallback={<div className="mb-6 h-[74px]" />}>
        <JobsSearch resultCount={matches.length} />
      </Suspense>

      {matches.length === 0 ? (
        <EmptyState
          icon={filtered ? SearchX : Target}
          title={filtered ? 'Nothing fits those filters' : 'No matches yet'}
          body={
            filtered
              ? 'Clear a filter, or run a new scan to score fresh roles.'
              : 'Run a scan and Match will score the latest roles against your skills, titles and preferences.'
          }
          action={filtered ? undefined : <FindMatchesButton />}
        />
      ) : (
        <JobMatchesPaged matches={matches} pageSize={8} />
      )}
    </>
  );
}
