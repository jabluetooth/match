import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Mail } from 'lucide-react';
import { PageHead } from '@/components/system/page-head';
import { EmptyState } from '@/components/system/empty-state';
import { FollowUpCard } from '@/components/followup-card';

export const revalidate = 30;
export const metadata = { title: 'Follow-ups' };

export default async function FollowUpsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [followUps, totalSent, totalReplied] = await Promise.all([
    prisma.followUpLog.findMany({
      where: { userId, responseStatus: 'pending' },
      include: { application: { include: { job: true } } },
      orderBy: { sentAt: 'desc' },
    }),
    prisma.followUpLog.count({ where: { userId } }),
    prisma.followUpLog.count({ where: { userId, responseStatus: 'replied' } }),
  ]);

  const responseRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 1000) / 10 : 0;

  return (
    <>
      <PageHead
        kicker="05 · follow-ups"
        title={<>Follow-ups &amp; <em>cadence</em></>}
        lead="Follow-up emails that have gone out and are waiting on a reply. Record what happened and Match recalculates your response rate."
      />

      {totalSent > 0 && (
        <dl className="panel mb-8 grid grid-cols-3 divide-x divide-line">
          <div className="p-5">
            <dt className="eyebrow">Response rate</dt>
            <dd className="mt-3 font-mono text-[2.5rem] font-medium leading-none tracking-[-0.04em] text-ink">
              {responseRate}
              <span className="ml-0.5 align-top text-base text-accent">%</span>
            </dd>
          </div>
          <div className="p-5">
            <dt className="eyebrow">Sent</dt>
            <dd className="mt-3 font-mono text-[2.5rem] font-medium leading-none tracking-[-0.04em] text-ink">{totalSent}</dd>
          </div>
          <div className="p-5">
            <dt className="eyebrow">Replied</dt>
            <dd className="mt-3 font-mono text-[2.5rem] font-medium leading-none tracking-[-0.04em] text-ink">{totalReplied}</dd>
          </div>
        </dl>
      )}

      <h2 className="eyebrow mb-4">
        Waiting on a reply <span className="text-ink-2">{followUps.length}</span>
      </h2>

      {followUps.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Nothing waiting"
          body={
            totalSent > 0
              ? 'Every follow-up has an outcome recorded. New ones appear here when they go out.'
              : 'Follow-up emails sent for your applications show up here until you record a reply.'
          }
        />
      ) : (
        <ol className="grid gap-4 xl:grid-cols-2">
          {followUps.map(followUp => (
            <li key={followUp.id}>
              <FollowUpCard followUp={followUp} onResponse={undefined} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
