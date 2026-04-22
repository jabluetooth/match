import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApplicationBoard } from '@/components/application-board';

// Revalidate this page every 30 seconds (more frequent for applications)
export const revalidate = 30;

async function getApplications(userId: string) {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      job: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return applications;
}

export default async function ApplicationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const applications = await getApplications(userId);

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
