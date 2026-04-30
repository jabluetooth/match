import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { Clock, MapPin, User, ExternalLink, FileText } from 'lucide-react';
import { InterviewPrepButton } from '@/components/interview-prep-button';
import { ScheduleInterviewModal } from '@/components/application-actions';
import Link from 'next/link';

export const revalidate = 60;

export default async function InterviewsPage() {
  const user = await requireUserWithSync();

  const [applications, schedulable] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id, interviewDate: { not: null } },
      include: { job: true },
      orderBy: { interviewDate: 'asc' },
    }),
    prisma.application.findMany({
      where: { userId: user.id, interviewDate: null, status: { in: ['interested', 'applied', 'phone_screen'] } },
      include: { job: { select: { title: true, companyName: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const appIds = applications.map(a => a.id);
  const preps = await prisma.interviewPrep.findMany({
    where: { applicationId: { in: appIds } },
    select: { id: true, applicationId: true, pdfGenerated: true },
  });
  const prepByAppId = new Map(preps.map(p => [p.applicationId, p]));

  const now = new Date();
  const upcoming = applications.filter(app => app.interviewDate && app.interviewDate > now);
  const past     = applications.filter(app => app.interviewDate && app.interviewDate <= now);

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <h1>Interview <em>calendar</em></h1>
          <p>{upcoming.length} upcoming · with prep guides and AI coaching</p>
        </div>
        <ScheduleInterviewModal
          applications={schedulable.map(a => ({
            id: a.id,
            jobTitle: a.job.title,
            companyName: a.job.companyName,
          }))}
        />
      </div>

      {/* Upcoming */}
      <section style={{ marginBottom: 36 }}>
        <p className="card-title" style={{ marginBottom: 16 }}>Upcoming — {upcoming.length}</p>

        {upcoming.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px var(--pad)' }}>
            <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>No upcoming interviews scheduled</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {upcoming.map(app => (
              <div key={app.id} className="interview-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
                      {app.job.title}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '4px 0 0' }}>
                      {app.job.companyName}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {app.interviewType && (
                      <span className={`interview-type ${app.interviewType}`}>
                        {app.interviewType.charAt(0).toUpperCase() + app.interviewType.slice(1)}
                      </span>
                    )}
                    <a href={app.job.sourceUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--ink-3)', display: 'grid', placeItems: 'center' }}>
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>

                {app.interviewDate && (
                  <p className="interview-time">
                    {new Date(app.interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {' · '}
                    {new Date(app.interviewDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>
                  {app.interviewLocation && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={12} />{app.interviewLocation}</span>
                  )}
                  {app.interviewerName && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <User size={12} />{app.interviewerName}{app.interviewerRole ? ` — ${app.interviewerRole}` : ''}
                    </span>
                  )}
                </div>

                {app.notes && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--ink-2)' }}>
                    {app.notes}
                  </div>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--line-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {prepByAppId.has(app.id) ? (
                    <Link
                      href={`/interview-prep/${prepByAppId.get(app.id)!.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      <FileText size={13} />
                      View Prep Guide
                    </Link>
                  ) : (
                    <InterviewPrepButton
                      applicationId={app.id}
                      jobTitle={app.job.title}
                      companyName={app.job.companyName}
                      interviewerName={app.interviewerName}
                      interviewerRole={app.interviewerRole}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <p className="card-title" style={{ marginBottom: 16 }}>Past — {past.length}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {past.map(app => (
              <div key={app.id} className="interview-card" style={{ opacity: 0.65 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
                      {app.job.title}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '3px 0 0' }}>
                      {app.job.companyName}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: 'var(--bg-2)', color: 'var(--ink-3)' }}>
                    {app.status}
                  </span>
                </div>
                {app.interviewDate && (
                  <p className="interview-time" style={{ marginTop: 8, opacity: 0.8 }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: 5 }} />
                    {new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
