import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { StatsGrid } from '@/components/stats-grid';
import { RecentMatches } from '@/components/recent-matches';
import { ApplicationFunnel } from '@/components/application-funnel';
import { ActivityFeed } from '@/components/activity-feed';

async function getDashboardData(userId: string) {
  // Get stats
  const [totalApplications, activeApplications, interviews, offers] = await Promise.all([
    prisma.application.count({
      where: { userId },
    }),
    prisma.application.count({
      where: { userId, status: { in: ['applied', 'phone_screen', 'interview'] } },
    }),
    prisma.application.count({
      where: {
        userId,
        interviewDate: { not: null },
        interviewDate: { gte: new Date() },
      },
    }),
    prisma.application.count({
      where: { userId, status: 'offer' },
    }),
  ]);

  // Get recent applications
  const recentApplications = await prisma.application.findMany({
    where: { userId },
    include: { job: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Map to match component interface (add matchScore based on status)
  const recentMatches = recentApplications.map(app => ({
    ...app,
    matchScore: app.status === 'offer' ? 100 : app.status === 'interview' ? 90 : app.status === 'phone_screen' ? 80 : 75,
    aiReasoning: null,
    skillsMatched: [],
    skillsMissing: [],
  }));

  // Get application funnel data
  const applicationStats = await prisma.application.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });

  // Get recent activity
  const recentActivity = await prisma.applicationEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    stats: {
      totalMatches: totalApplications,
      activeApplications,
      interviews,
      offers,
    },
    recentMatches,
    applicationStats,
    recentActivity,
  };
}

export default async function DashboardPage() {
  // Authenticate and get user
  const user = await requireUserWithSync();
  const data = await getDashboardData(user.id);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your job search overview.</p>
      </div>

      <StatsGrid stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentMatches matches={data.recentMatches} />
        <ApplicationFunnel data={data.applicationStats} />
      </div>

      <div className="mt-6">
        <ActivityFeed activities={data.recentActivity} />
      </div>
    </div>
  );
}
