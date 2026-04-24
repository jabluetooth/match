import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApplicationBoard } from '@/components/application-board';
import { Clock } from 'lucide-react';

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

  const groupedApplications = {
    draft:     applications.filter(app => app.status === 'draft'),
    submitted: applications.filter(app => app.status === 'submitted'),
    screening: applications.filter(app => app.status === 'screening'),
    interview: applications.filter(app => app.status === 'interview'),
    offer:     applications.filter(app => app.status === 'offer'),
    rejected:  applications.filter(app => app.status === 'rejected'),
  };

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <h1>Your <em>pipeline</em></h1>
          <p>{applications.length} application{applications.length === 1 ? '' : 's'} · track their journey from submit to offer</p>
        </div>
        <div className="chip">
          <Clock size={13} />
          Avg. time-to-response: 8 days
        </div>
      </div>

      <ApplicationBoard applications={groupedApplications} />
    </div>
  );
}
