import { prisma } from '@/lib/prisma';
import { ApplicationBoard } from '@/components/application-board';

async function getApplications(userId: number = 1) {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      jobMatch: {
        include: {
          job: true,
        },
      },
      interviews: {
        orderBy: { scheduledDate: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Convert Decimal to number for client components
  return applications.map(app => ({
    ...app,
    jobMatch: {
      ...app.jobMatch,
      matchScore: Number(app.jobMatch.matchScore),
    },
  }));
}

export default async function ApplicationsPage() {
  const applications = await getApplications();

  // Group by status for Kanban view
  const groupedApplications = {
    draft: applications.filter(app => app.status === 'draft'),
    submitted: applications.filter(app => app.status === 'submitted'),
    screening: applications.filter(app => app.status === 'screening'),
    interview: applications.filter(app => app.status === 'interview'),
    offer: applications.filter(app => app.status === 'offer'),
    rejected: applications.filter(app => app.status === 'rejected'),
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-2">
          Track and manage your job applications
        </p>
      </div>

      <ApplicationBoard applications={groupedApplications} />
    </div>
  );
}
