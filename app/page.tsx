import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { StatsGrid } from '@/components/stats-grid';
import { RecentMatches } from '@/components/recent-matches';
import { ApplicationFunnel } from '@/components/application-funnel';
import { ActivityFeed } from '@/components/activity-feed';

// Cache dashboard for 30 seconds
export const revalidate = 30;

async function getDashboardData(userId: string) {
  // Optimize: Fetch all data in parallel with minimal queries
  const [allApplications, applicationStats, recentActivity] = await Promise.all([
    // Single query to get all applications with related data
    prisma.application.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    }),
    // Get status counts
    prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    }),
    // Get recent activity
    prisma.applicationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  // Calculate stats from the fetched data (no extra queries)
  const now = new Date();
  const totalApplications = allApplications.length;
  const activeApplications = allApplications.filter(
    app => ['applied', 'phone_screen', 'interview'].includes(app.status)
  ).length;
  const interviews = allApplications.filter(
    app => app.interviewDate && app.interviewDate >= now
  ).length;
  const offers = allApplications.filter(app => app.status === 'offer').length;

  // Get recent 5 for display
  const recentMatches = allApplications.slice(0, 5).map(app => ({
    ...app,
    matchScore: app.status === 'offer' ? 100 : app.status === 'interview' ? 90 : app.status === 'phone_screen' ? 80 : 75,
    aiReasoning: null,
    skillsMatched: [],
    skillsMissing: [],
  }));

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
