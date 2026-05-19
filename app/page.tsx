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

const APPLIED_STATUSES = ['applied', 'submitted', 'phone_screen', 'screening', 'interview', 'final_round', 'offer', 'accepted'];
const ACTIVE_STATUSES = ['applied', 'submitted', 'phone_screen', 'screening', 'interview', 'final_round'];
const INTERVIEW_OR_LATER = ['phone_screen', 'screening', 'interview', 'final_round', 'offer', 'accepted'];

async function getDashboardData(userId: string) {
  const [allApplications, applicationStats, recentActivity, profile, jobMatchCount] = await Promise.all([
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
    prisma.userProfile.findFirst({ where: { userId } }),
    prisma.jobMatch.count({ where: { userId } }),
  ]);

  const now = new Date();
  const totalApplications = allApplications.length;
  const activeApplications = allApplications.filter((app) => ACTIVE_STATUSES.includes(app.status)).length;
  const upcomingInterviews = allApplications
    .filter((app) => app.interviewDate && app.interviewDate >= now)
    .sort((a, b) => a.interviewDate!.getTime() - b.interviewDate!.getTime());
  const interviews = upcomingInterviews.length;
  const nextInterview = upcomingInterviews[0] ?? null;
  const offers = allApplications.filter((app) => app.status === 'offer').length;

  const hasReachedAppliedStage = allApplications.some((app) => APPLIED_STATUSES.includes(app.status));
  const hasReachedInterviewStage =
    allApplications.some((app) => INTERVIEW_OR_LATER.includes(app.status)) ||
    allApplications.some((app) => app.interviewDate != null);

  const profileComplete = Boolean(
    profile &&
      (profile.skills.length > 0 || profile.jobTitles.length > 0 || profile.baseResumeUrl),
  );

  const recentMatches = allApplications.slice(0, 6).map((app) => ({
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
    stats: {
      totalApplications,
      activeApplications,
      interviews,
      offers,
      nextInterview,
      jobMatchCount,
    },
    onboarding: {
      profileComplete,
      hasMatches: jobMatchCount > 0,
      hasApplied: hasReachedAppliedStage,
      hasInterview: hasReachedInterviewStage,
    },
    recentMatches,
    applicationStats,
    recentActivity,
  };
}

function buildOnboardingSteps(flags: {
  profileComplete: boolean;
  hasMatches: boolean;
  hasApplied: boolean;
  hasInterview: boolean;
}): OnboardingStep[] {
  const rawSteps = [
    { num: 1, title: 'Create account',          desc: 'Sign in with email or social auth',           action: '',              href: '',            done: true },
    { num: 2, title: 'Complete your profile',   desc: 'Add skills, preferences, and a resume',       action: 'Open Settings', href: '/settings',   done: flags.profileComplete },
    { num: 3, title: 'Find your first matches', desc: 'Let the AI scan and match you to open roles', action: 'Find Matches',  href: '/jobs',       done: flags.hasMatches },
    { num: 4, title: 'Apply to a role',         desc: 'Submit your first tailored application',      action: 'Browse Jobs',   href: '/jobs',       done: flags.hasApplied },
    { num: 5, title: 'Land an interview',       desc: 'Get that first callback and prepare with AI', action: 'Interviews',    href: '/interviews', done: flags.hasInterview },
  ];

  let foundActive = false;
  return rawSteps.map((step) => {
    if (step.done) return { ...step, status: 'done' as const };
    if (!foundActive) { foundActive = true; return { ...step, status: 'active' as const }; }
    return { ...step, status: 'pending' as const };
  });
}

export default async function DashboardPage() {
  const user = await requireUserWithSync();
  const data = await getDashboardData(user.id);
  const firstName = user.fullName?.split(' ')[0] ?? null;
  const onboardingSteps = buildOnboardingSteps(data.onboarding);

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
          sub={`of ${data.stats.totalApplications} total application${data.stats.totalApplications === 1 ? '' : 's'}`}
          icon={<TrendingUp size={16} />}
        />

        {/* Row 2: onboarding steps (span 2) + sky stat tile */}
        <OnboardingSteps steps={onboardingSteps} />
        <StatTile
          placement="g-stat-b"
          variant="sky"
          label="Upcoming Interviews"
          value={data.stats.interviews}
          sub={
            data.stats.nextInterview
              ? `Next: ${data.stats.nextInterview.interviewDate!.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — ${data.stats.nextInterview.job.companyName}`
              : data.stats.offers > 0
                ? `${data.stats.offers} offer${data.stats.offers === 1 ? '' : 's'} received`
                : 'Schedule your first interview'
          }
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
