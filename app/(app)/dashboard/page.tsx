import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { PageHead } from '@/components/system/page-head';
import { PipelineRail } from '@/components/system/stage-rail';
import { Readings } from '@/components/dashboard/readings';
import { SetupChecklist, type OnboardingStep } from '@/components/dashboard/setup-checklist';
import { RecentApplications } from '@/components/dashboard/recent-applications';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { pipelineStages } from '@/lib/status';

export const metadata = { title: 'Dashboard' };

export const revalidate = 30;

const APPLIED_STATUSES = ['applied', 'submitted', 'phone_screen', 'screening', 'interview', 'final_round', 'offer', 'accepted'];
const ACTIVE_STATUSES = ['applied', 'submitted', 'phone_screen', 'screening', 'interview', 'final_round'];
const INTERVIEW_OR_LATER = ['phone_screen', 'screening', 'interview', 'final_round', 'offer', 'accepted'];

async function getDashboardData(userId: string) {
  const [allApplications, recentActivity, profile, rawMatches] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.applicationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      // The workflow writes empty metadata, so name the job from the row itself.
      include: { application: { select: { job: { select: { title: true, companyName: true } } } } },
    }),
    prisma.userProfile.findFirst({ where: { userId } }),
    // Pending matches that the jobs page would actually surface.
    prisma.jobMatch.findMany({
      where: { userId, status: 'pending' },
      select: { jobId: true },
    }),
  ]);

  // Drop matches whose Job has been deleted/excluded — same filter the
  // /jobs page applies, so the dashboard count matches what's rendered there.
  const matchedJobIds = Array.from(
    new Set(rawMatches.map((m) => m.jobId).filter((id): id is number => id != null)),
  );
  const existingJobs = matchedJobIds.length > 0
    ? await prisma.job.findMany({ where: { id: { in: matchedJobIds } }, select: { id: true } })
    : [];
  const existingJobIdSet = new Set(existingJobs.map((j) => j.id));
  const jobMatchCount = rawMatches.filter(
    (m) => m.jobId != null && existingJobIdSet.has(m.jobId),
  ).length;

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

  // Most recently touched first, so a status change floats an application up.
  const recentApplications = [...allApplications]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

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
    recentApplications,
    stages: pipelineStages(allApplications.map((a) => a.status)),
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
  const { stats } = data;
  const next = stats.nextInterview;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

  return (
    <>
      <PageHead
        kicker="01 · dashboard"
        title={firstName ? <>Good to see you, <em>{firstName}</em>.</> : <>Your job search, <em>at a glance</em>.</>}
        lead={
          stats.jobMatchCount > 0
            ? `${plural(stats.jobMatchCount, 'match')} waiting for a look and ${plural(stats.activeApplications, 'application')} in flight.`
            : 'Find matches, apply with a tailored resume, and every step lands here.'
        }
        actions={
          <>
            <Link href="/applications" className="btn btn-ghost">Applications</Link>
            <Link href="/jobs" className="btn btn-primary">
              <Target size={14} aria-hidden="true" />
              View matches
            </Link>
          </>
        }
      />

      <div className="space-y-6">
        <Readings
          items={[
            {
              label: 'Matches waiting',
              value: stats.jobMatchCount,
              sub: stats.jobMatchCount > 0 ? 'Scored against your profile' : 'Run a scan from Job matches',
              href: '/jobs',
            },
            {
              label: 'Active',
              value: stats.activeApplications,
              sub: `of ${plural(stats.totalApplications, 'application')}`,
              href: '/applications',
            },
            {
              label: 'Interviews',
              value: stats.interviews,
              sub: next
                ? `Next: ${next.interviewDate!.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${next.job.companyName}`
                : 'None scheduled',
              href: '/interviews',
              interview: true,
            },
            {
              label: 'Offers',
              value: stats.offers,
              sub: stats.offers > 0 ? 'Congratulations' : 'Not yet',
              href: '/applications',
            },
          ]}
        />

        <section className="panel p-5 sm:p-6" aria-labelledby="pipeline-title">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="pipeline-title" className="eyebrow">Pipeline</h2>
            <Link href="/applications" className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-3 hover:text-accent-ink">
              open <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
          <PipelineRail stages={data.stages} />
        </section>

        <SetupChecklist steps={onboardingSteps} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <RecentApplications items={data.recentApplications} />
          <ActivityTimeline activities={data.recentActivity} />
        </div>
      </div>
    </>
  );
}
