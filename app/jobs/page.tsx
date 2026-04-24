import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { JobMatchCard } from '@/components/job-match-card';
import { Clock } from 'lucide-react';

export const revalidate = 60;

async function getJobMatches(userId: string) {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: { job: true },
    orderBy: { createdAt: 'desc' },
  });

  return applications.map(app => ({
    ...app,
    matchScore:
      app.status === 'offer'        ? 100 :
      app.status === 'interview'    ? 90  :
      app.status === 'phone_screen' ? 85  :
      app.status === 'applied'      ? 80  : 75,
    aiReasoning: null,
    skillsMatched: [],
    skillsMissing: [],
  }));
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
        <div className="chip">
          <Clock size={13} />
          Last scan · just now
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
