import { prisma } from '@/lib/prisma';
import { StatsGrid } from '@/components/stats-grid';
import { RecentMatches } from '@/components/recent-matches';
import { ApplicationFunnel } from '@/components/application-funnel';
import { ActivityFeed } from '@/components/activity-feed';

async function getDashboardData(userId: number = 1) {
  // Get stats
  const [totalMatches, activeApplications, interviews, offers] = await Promise.all([
    prisma.jobMatch.count({
      where: { userId, matchScore: { gte: 70 } },
    }),
    prisma.application.count({
      where: { userId, status: { in: ['submitted', 'screening', 'interview'] } },
    }),
    prisma.interview.count({
      where: { 
        application: { userId },
        status: 'scheduled',
      },
    }),
    prisma.application.count({
      where: { userId, status: 'offer' },
    }),
  ]);

  // Get recent matches
  const recentMatchesRaw = await prisma.jobMatch.findMany({
    where: { userId, matchScore: { gte: 70 } },
    include: { job: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Serialize Decimal to number for Client Components
  const recentMatches = recentMatchesRaw.map(match => ({
    ...match,
    matchScore: Number(match.matchScore),
  }));

  // Get application funnel data
  const applicationStats = await prisma.application.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });

  // Get recent activity
  const recentActivity = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    stats: {
      totalMatches,
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
  const data = await getDashboardData();

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
