import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { HeroSection } from '@/components/hero-section';
import { OnboardingSteps, type OnboardingStep } from '@/components/onboarding-steps';
import { StatTile } from '@/components/stats-grid';
import { RecentMatches } from '@/components/recent-matches';
import { ApplicationFunnel } from '@/components/application-funnel';
import { ActivityFeed } from '@/components/activity-feed';
import { Calendar, TrendingUp } from 'lucide-react';

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
  const totalMatches = allApplications.length;
  const activeApplications = allApplications.filter(
    app => ['applied', 'phone_screen', 'interview'].includes(app.status)
  ).length;
  const interviews = allApplications.filter(
    app => app.interviewDate && app.interviewDate >= now
  ).length;
  const offers = allApplications.filter(app => app.status === 'offer').length;

  const recentMatches = allApplications.slice(0, 6).map(app => ({
    ...app,
    matchScore:
      app.status === 'offer' ? 100 :
      app.status === 'interview' ? 90 :
      app.status === 'phone_screen' ? 80 : 75,
    aiReasoning: null,
    skillsMatched: [],
    skillsMissing: [],
  }));

  return {
    stats: { totalMatches, activeApplications, interviews, offers },
    recentMatches,
    applicationStats,
    recentActivity,
  };
}

function buildOnboardingSteps(
  user: { fullName: string | null },
  stats: { totalMatches: number; activeApplications: number; interviews: number }
): OnboardingStep[] {
  const hasProfile  = !!(user.fullName?.trim());
  const hasMatches  = stats.totalMatches > 0;
  const hasActive   = stats.activeApplications > 0;
  const hasInterview = stats.interviews > 0;

  const rawSteps = [
    { num: 1, title: 'Create account',          desc: 'Sign in with email or social auth',                action: '',               href: '',            done: true },
    { num: 2, title: 'Complete your profile',    desc: 'Add skills, job preferences, and location',       action: 'Open Settings',  href: '/settings',   done: hasProfile },
    { num: 3, title: 'Find your first matches',  desc: 'Let the AI scan and match you to open roles',     action: 'Find Matches',   href: '/jobs',       done: hasMatches },
    { num: 4, title: 'Apply to a role',          desc: 'Submit your first tailored application',          action: 'Browse Jobs',    href: '/jobs',       done: hasActive },
    { num: 5, title: 'Land an interview',        desc: 'Get that first callback and prepare with AI',     action: 'Interviews',     href: '/interviews', done: hasInterview },
  ];

  let foundActive = false;
  return rawSteps.map(step => {
    if (step.done) return { ...step, status: 'done' as const };
    if (!foundActive) { foundActive = true; return { ...step, status: 'active' as const }; }
    return { ...step, status: 'pending' as const };
  });
}

export default async function DashboardPage() {
  const user = await requireUserWithSync();
  const data = await getDashboardData(user.id);
  const firstName = user.fullName?.split(' ')[0] ?? null;
  const onboardingSteps = buildOnboardingSteps(user, data.stats);

  return (
    <div className="shell">
      <div className="dash-grid">
        {/* Row 1: hero (span 2) + peach stat tile */}
        <HeroSection firstName={firstName} stats={data.stats} />
        <StatTile
          placement="g-stat-a"
          variant="peach"
          label="Active Applications"
          value={data.stats.activeApplications}
          sub={`of ${data.stats.totalMatches} total match${data.stats.totalMatches === 1 ? '' : 'es'}`}
          icon={<TrendingUp size={16} />}
        />

        {/* Row 2: onboarding steps (span 2) + sky stat tile */}
        <OnboardingSteps steps={onboardingSteps} />
        <StatTile
          placement="g-stat-b"
          variant="sky"
          label="Upcoming Interviews"
          value={data.stats.interviews}
          sub={data.stats.offers > 0
            ? `${data.stats.offers} offer${data.stats.offers === 1 ? '' : 's'} received`
            : 'Schedule your first interview'}
          icon={<Calendar size={16} />}
        />

        {/* Row 3: funnel + matches + activity */}
        <ApplicationFunnel data={data.applicationStats} />
        <RecentMatches matches={data.recentMatches} />
        <ActivityFeed activities={data.recentActivity} />
      </div>
    </div>
  );
}
