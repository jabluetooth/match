import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, Mail, Plus } from 'lucide-react';
import { FollowUpCard } from '@/components/followup-card';

export const revalidate = 30;

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
    <div className="shell">
      <div className="page-head">
        <div>
          <h1>Follow-ups &amp; <em>cadence</em></h1>
          <p>Auto-scheduled reminders to stay top-of-mind</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {totalSent > 0 && (
            <div className="card" style={{ padding: '14px 20px', textAlign: 'center', minWidth: 160 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.02em', color: 'var(--primary)', margin: 0, lineHeight: 1 }}>
                {responseRate}%
              </p>
              <p className="card-title" style={{ marginTop: 4 }}>Response rate</p>
              <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '4px 0 0' }}>
                {totalReplied} of {totalSent} replied
              </p>
            </div>
          )}
          <button className="btn btn-primary" type="button">
            <Plus size={14} />
            Add follow-up
          </button>
        </div>
      </div>

      {followUps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px var(--pad)' }}>
          <Mail size={40} style={{ color: 'var(--line-2)', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--ink)' }}>
            No pending follow-ups
          </h3>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            All your follow-up emails have been responded to or processed.
          </p>
        </div>
      ) : (
        <div className="followup-timeline">
          {followUps.map(followUp => (
            <div key={followUp.id} className="followup-item pending">
              <FollowUpCard followUp={followUp} onResponse={undefined} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
