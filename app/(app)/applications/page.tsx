import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApplicationsPipeline, DEFAULT_PIPELINE_STAGES } from '@/components/applications-pipeline';
import { ApplicationsList } from '@/components/applications-list';

export const revalidate = 30;

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

  const stageCount = (statuses: readonly string[]) =>
    applications.filter((a) => statuses.includes(a.status)).length;

  const stages = [
    {
      key: 'applied',
      label: DEFAULT_PIPELINE_STAGES.applied.label,
      icon: DEFAULT_PIPELINE_STAGES.applied.icon,
      count: stageCount(DEFAULT_PIPELINE_STAGES.applied.statuses),
    },
    {
      key: 'screened',
      label: DEFAULT_PIPELINE_STAGES.screened.label,
      icon: DEFAULT_PIPELINE_STAGES.screened.icon,
      count: stageCount(DEFAULT_PIPELINE_STAGES.screened.statuses),
    },
    {
      key: 'interview',
      label: DEFAULT_PIPELINE_STAGES.interview.label,
      icon: DEFAULT_PIPELINE_STAGES.interview.icon,
      count: stageCount(DEFAULT_PIPELINE_STAGES.interview.statuses),
    },
    {
      key: 'offer',
      label: DEFAULT_PIPELINE_STAGES.offer.label,
      icon: DEFAULT_PIPELINE_STAGES.offer.icon,
      count: stageCount(DEFAULT_PIPELINE_STAGES.offer.statuses),
    },
  ];

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

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <h1>Your <em>pipeline</em></h1>
          <p>
            {applications.length} application{applications.length === 1 ? '' : 's'} · tracked from submit to offer
          </p>
        </div>
      </div>

      <ApplicationsPipeline stages={stages} total={applications.length} />

      <ApplicationsList applications={listItems} />
    </div>
  );
}
