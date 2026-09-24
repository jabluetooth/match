import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { Building2, CalendarDays, ExternalLink, FileText, MapPin, Phone, User, Video } from 'lucide-react';
import { PageHead } from '@/components/system/page-head';
import { EmptyState } from '@/components/system/empty-state';
import { StatusPill } from '@/components/system/status-pill';
import { InterviewPrepButton } from '@/components/interview-prep-button';
import { ScheduleInterviewModal } from '@/components/application-actions';
import { safeExternalUrl } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 60;
export const metadata = { title: 'Interviews' };

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
    <>
      <PageHead
        kicker="04 · interviews"
        title={<>Interview <em>calendar</em></>}
        lead={`${upcoming.length} upcoming, each with a prep guide on request.`}
        actions={
          <ScheduleInterviewModal
            applications={schedulable.map(a => ({
              id: a.id,
              jobTitle: a.job.title,
              companyName: a.job.companyName,
            }))}
          />
        }
      />

      <section aria-labelledby="upcoming-title" className="mb-12">
        <h2 id="upcoming-title" className="eyebrow mb-4">
          Upcoming <span className="text-ink-2">{upcoming.length}</span>
        </h2>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing on the calendar"
            body={
              schedulable.length > 0
                ? 'Got a callback? Schedule it and Match will offer a prep guide for it.'
                : 'When an application gets a callback, schedule it here.'
            }
          />
        ) : (
          <ol className="space-y-4">
            {upcoming.map(app => {
              const sourceUrl = safeExternalUrl(app.job.sourceUrl);
              const date = new Date(app.interviewDate!);
              const prep = prepByAppId.get(app.id);
              return (
                <li key={app.id} className="panel grid overflow-hidden sm:grid-cols-[120px_minmax(0,1fr)]">
                  {/* Date block: the one place violet leads, because this is the interview. */}
                  <div className="flex items-center gap-4 border-b border-line bg-interview/[0.06] px-5 py-4 sm:flex-col sm:items-start sm:justify-center sm:gap-0 sm:border-b-0 sm:border-r sm:border-l-2 sm:border-l-interview">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-interview-ink">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="font-mono text-4xl font-medium leading-none tracking-tight text-ink sm:mt-1">
                      {date.toLocaleDateString('en-US', { day: 'numeric' })}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 sm:mt-1">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="ml-auto font-mono text-xs text-ink-2 sm:ml-0 sm:mt-3">
                      {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-2xl leading-tight text-ink">{app.job.title}</h3>
                        <p className="mt-0.5 text-sm text-ink-2">{app.job.companyName}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {app.interviewType && (
                          <span className="inline-flex h-6 items-center gap-1.5 rounded border border-interview/30 bg-interview/15 px-2 font-mono text-[11px] capitalize text-interview-ink">
                            {app.interviewType === 'phone' ? <Phone size={11} aria-hidden="true" /> : app.interviewType === 'onsite' ? <Building2 size={11} aria-hidden="true" /> : <Video size={11} aria-hidden="true" />}
                            {app.interviewType === 'onsite' ? 'On-site' : app.interviewType}
                          </span>
                        )}
                        {sourceUrl && (
                          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open the ${app.job.title} posting`}
                            className="grid size-8 place-items-center rounded text-ink-3 hover:bg-raised hover:text-ink">
                            <ExternalLink size={13} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>

                    {(app.interviewLocation || app.interviewerName) && (
                      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-3">
                        {app.interviewLocation && (
                          <div className="flex min-w-0 items-center gap-1.5">
                            <dt><MapPin size={12} aria-label="Where" /></dt>
                            <dd className="truncate">{app.interviewLocation}</dd>
                          </div>
                        )}
                        {app.interviewerName && (
                          <div className="flex items-center gap-1.5">
                            <dt><User size={12} aria-label="With" /></dt>
                            <dd>{app.interviewerName}{app.interviewerRole ? `, ${app.interviewerRole}` : ''}</dd>
                          </div>
                        )}
                      </dl>
                    )}

                    {app.notes && (
                      <p className="mt-3 rounded border border-line bg-raised px-3 py-2 text-[13px] leading-relaxed text-ink-2">{app.notes}</p>
                    )}

                    <div className="mt-4 border-t border-dashed border-line pt-4">
                      {prep ? (
                        <Link href={`/interview-prep/${prep.id}`} className="btn btn-ghost btn-sm">
                          <FileText size={13} aria-hidden="true" />
                          Open prep guide
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
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-title">
          <h2 id="past-title" className="eyebrow mb-4">
            Past <span className="text-ink-2">{past.length}</span>
          </h2>
          <ul className="panel divide-y divide-line">
            {past.map(app => (
              <li key={app.id} className="flex items-center gap-4 px-5 py-3">
                <time className="w-24 shrink-0 font-mono text-xs text-ink-3" dateTime={app.interviewDate!.toISOString()}>
                  {new Date(app.interviewDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </time>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink-2">{app.job.title}</p>
                  <p className="truncate text-xs text-ink-3">{app.job.companyName}</p>
                </div>
                <StatusPill status={app.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
