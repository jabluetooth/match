import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHead } from '@/components/system/page-head';
import { PipelineRail } from '@/components/system/stage-rail';
import { pipelineStages } from '@/lib/status';
import { ApplicationsList } from '@/components/applications-list';

export const revalidate = 30;
export const metadata = { title: 'Applications' };

async function getApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: { job: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export default async function ApplicationsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const applications = await getApplications(userId);

  const stages = pipelineStages(applications.map((a) => a.status));

  const listItems = applications.map((a) => ({
    id: a.id,
    status: a.status,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    appliedAt: a.appliedAt,
    job: {
      id: a.job.id,
      title: a.job.title,
      companyName: a.job.companyName,
      location: a.job.location,
      sourceUrl: a.job.sourceUrl,
    },
  }));

  const plural = applications.length === 1 ? '' : 's';

  return (
    <>
      <PageHead
        kicker="03 · applications"
        title={<>Your <em>pipeline</em></>}
        lead={`${applications.length} application${plural}, tracked from submit to offer.`}
      />

      {applications.length > 0 && (
        <section className="panel mb-8 p-5 sm:p-6" aria-label="Pipeline">
          <PipelineRail stages={stages} />
          <p className="mt-6 font-mono text-[11px] text-ink-3">
            Counts are cumulative: an application in its final round also counts as applied and screened.
          </p>
        </section>
      )}

      <ApplicationsList applications={listItems} />
    </>
  );
}
