import { prisma } from '@/lib/prisma';

export type NotificationKind = 'interview' | 'followup' | 'match';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle: string;
  /** ISO string so client serialization is stable. */
  timestamp: string | null;
  href: string;
  /** Highlight as urgent (red dot) — e.g. interviews within 24h. */
  urgent?: boolean;
}

const DAY_MS = 86_400_000;

/**
 * Returns up to ~10 actionable signals for the authenticated user:
 *   - Interviews scheduled in the next 7 days
 *   - Follow-ups sent >5 days ago that haven't received a response
 *   - Job matches created in the last 24 hours
 *
 * Sorted by urgency: interviews within 24h first, then by timestamp.
 */
export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * DAY_MS);
  const fiveDaysAgo = new Date(now.getTime() - 5 * DAY_MS);
  const oneDayAgo = new Date(now.getTime() - DAY_MS);
  const in24Hours = new Date(now.getTime() + DAY_MS);

  const [interviews, pendingFollowups, freshMatches] = await Promise.all([
    prisma.application.findMany({
      where: {
        userId,
        interviewDate: { gte: now, lte: in7Days },
      },
      include: { job: { select: { title: true, companyName: true } } },
      orderBy: { interviewDate: 'asc' },
      take: 5,
    }),
    prisma.followUpLog.findMany({
      where: {
        userId,
        responseStatus: 'pending',
        sentAt: { lte: fiveDaysAgo },
      },
      include: {
        application: { include: { job: { select: { title: true, companyName: true } } } },
      },
      orderBy: { sentAt: 'asc' },
      take: 5,
    }),
    prisma.jobMatch.findMany({
      where: {
        userId,
        status: 'pending',
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const items: NotificationItem[] = [];

  for (const app of interviews) {
    if (!app.interviewDate) continue;
    items.push({
      id: `interview-${app.id}`,
      kind: 'interview',
      title: `${app.job.companyName} interview`,
      subtitle: app.job.title,
      timestamp: app.interviewDate.toISOString(),
      href: '/interviews',
      urgent: app.interviewDate.getTime() <= in24Hours.getTime(),
    });
  }

  for (const fu of pendingFollowups) {
    items.push({
      id: `followup-${fu.id}`,
      kind: 'followup',
      title: `Awaiting reply: ${fu.application.job.companyName}`,
      subtitle: fu.application.job.title,
      timestamp: fu.sentAt.toISOString(),
      href: '/followups',
    });
  }

  if (freshMatches.length > 0) {
    items.push({
      id: 'matches-fresh',
      kind: 'match',
      title: `${freshMatches.length} new job match${freshMatches.length === 1 ? '' : 'es'}`,
      subtitle: 'Tailor a resume to apply',
      timestamp: freshMatches[0].createdAt.toISOString(),
      href: '/jobs',
    });
  }

  // Urgent first, then most-recent first
  items.sort((a, b) => {
    if (!!a.urgent !== !!b.urgent) return a.urgent ? -1 : 1;
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });

  return items.slice(0, 8);
}
