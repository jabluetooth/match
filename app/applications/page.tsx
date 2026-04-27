import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, ArrowUpRight } from 'lucide-react';

export const revalidate = 30;

async function getApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: { job: true },
    orderBy: { updatedAt: 'desc' },
  });
}

function getProgressPercentage(status: string): number {
  const statusMap: Record<string, number> = {
    draft: 10,
    applied: 20,
    submitted: 20,
    phone_screen: 40,
    screening: 40,
    interview: 75,
    offer: 100,
    rejected: 100,
    accepted: 100,
  };
  return statusMap[status] || 0;
}

function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    draft: 'Draft',
    applied: 'Applied',
    submitted: 'Applied',
    phone_screen: 'Screened',
    screening: 'Screened',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    accepted: 'Accepted',
  };
  return labelMap[status] || status;
}

function getStatusDescription(status: string): string {
  const descMap: Record<string, string> = {
    draft: 'Not submitted yet',
    applied: 'Awaiting response',
    submitted: 'Awaiting response',
    phone_screen: 'Phone screen scheduled',
    screening: 'Phone screen scheduled',
    interview: 'Final round preparing',
    offer: 'Offer received',
    rejected: 'No longer pursuing',
    accepted: 'Offer accepted',
  };
  return descMap[status] || '';
}

export default async function ApplicationsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const applications = await getApplications(userId);

  const appliedCount = applications.filter(app =>
    ['applied', 'submitted', 'phone_screen', 'screening', 'interview', 'offer', 'accepted'].includes(app.status)
  ).length;

  const screenedCount = applications.filter(app =>
    ['phone_screen', 'screening', 'interview', 'offer', 'accepted'].includes(app.status)
  ).length;

  const interviewCount = applications.filter(app =>
    ['interview', 'offer', 'accepted'].includes(app.status)
  ).length;

  const offerCount = applications.filter(app =>
    ['offer', 'accepted'].includes(app.status)
  ).length;

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <h1>Your <em>pipeline</em></h1>
          <p>{applications.length} application{applications.length === 1 ? '' : 's'} · track their journey from submit to offer</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="chip">
            <Clock size={13} />
            Avg. time-to-response: 8 days
          </div>
        </div>
      </div>

      {/* Funnel Snapshot */}
      <div style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Funnel snapshot</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink)' }}>{appliedCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: 4 }}>Applied</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink)' }}>{screenedCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: 4 }}>Screened</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink)' }}>{interviewCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: 4 }}>Interview</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink)' }}>{offerCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: 4 }}>Offer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Rows */}
      <div>
        {applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px var(--pad)' }}>
            <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
              No applications yet — start by finding job matches.
            </p>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="app-row">
              <div className="app-checkbox"></div>
              <div className="app-info">
                <div className="app-title">{app.job.title}</div>
                <div className="app-company">
                  {app.job.company} · {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className={`app-status ${app.status}`}>
                <span className="dot"></span>
                {getStatusLabel(app.status)}
              </div>
              <div className="app-status">
                {getStatusDescription(app.status)}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ justifySelf: 'end' }}
                type="button"
              >
                <ArrowUpRight size={14} />
              </button>
              <div style={{ gridColumn: '1/-1' }}>
                <div className="app-progress">
                  <span style={{ width: `${getProgressPercentage(app.status)}%` }}></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
