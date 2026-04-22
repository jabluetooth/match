import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { StatsGrid } from '@/components/stats-grid';
import { RecentMatches } from '@/components/recent-matches';
import { ApplicationFunnel } from '@/components/application-funnel';
import { ActivityFeed } from '@/components/activity-feed';

export const revalidate = 30;

async function getDashboardData(userId: string) {
  const [allApplications, applicationStats, recentActivity] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    }),
    prisma.applicationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const now = new Date();
  const totalApplications = allApplications.length;
  const activeApplications = allApplications.filter(
    app => ['applied', 'phone_screen', 'interview'].includes(app.status)
  ).length;
  const interviews = allApplications.filter(
    app => app.interviewDate && app.interviewDate >= now
  ).length;
  const offers = allApplications.filter(app => app.status === 'offer').length;

  const recentMatches = allApplications.slice(0, 6).map(app => ({
    ...app,
    matchScore: app.status === 'offer' ? 100 : app.status === 'interview' ? 90 : app.status === 'phone_screen' ? 80 : 75,
    aiReasoning: null,
    skillsMatched: [],
    skillsMissing: [],
  }));

  return {
    stats: { totalMatches: totalApplications, activeApplications, interviews, offers },
    recentMatches,
    applicationStats,
    recentActivity,
  };
}

export default async function DashboardPage() {
  const user = await requireUserWithSync();
  const data = await getDashboardData(user.id);
  const firstName = user.fullName?.split(' ')[0] ?? null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#080101' }}>
          Welcome back{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#473e3b' }}>
          Your personal job search overview
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left column — stats + funnel chart */}
        <div className="col-span-2 space-y-5">
          <StatsGrid stats={data.stats} userName={user.fullName} />
          <ApplicationFunnel data={data.applicationStats} />
        </div>

        {/* Right column — recent matches + activity */}
        <div className="col-span-1 space-y-5">
          <RecentMatches matches={data.recentMatches} />
          <ActivityFeed activities={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
