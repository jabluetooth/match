import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Diagnostics for the "Find New Matches" button. Used by the client to:
 *
 *  - Detect that n8n's matching workflow finished (pending count rises OR
 *    `lastMatchAt` advances, which covers low-score rejections too).
 *  - Tell the user *why* no matches appeared — e.g. the daily scrape didn't
 *    run, or every active job has already been scored.
 *
 *  The dashboard's "matches" tab only renders `status='pending'`, so we still
 *  return `count` (pending). But `total` and `lastMatchAt` let the button know
 *  n8n ran successfully even when nothing crossed the score threshold.
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      pendingCount,
      totalCount,
      lastMatch,
      lastScrapedJob,
      jobsLast24h,
      totalJobs,
      unmatchedJobs,
    ] = await Promise.all([
      prisma.jobMatch.count({ where: { userId, status: 'pending' } }),
      prisma.jobMatch.count({ where: { userId } }),
      prisma.jobMatch.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, matchScore: true },
      }),
      prisma.job.findFirst({
        where: { status: 'active' },
        orderBy: { scrapedAt: 'desc' },
        select: { scrapedAt: true },
      }),
      prisma.job.count({
        where: { status: 'active', scrapedAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.job.count({ where: { status: 'active' } }),
      // Mirrors the n8n "Get New Jobs" eligibility filter, but with a 7-day
      // window instead of "today only" so we don't show zero on Mondays.
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM jobs j
        WHERE j.status = 'active'
          AND j.scraped_at > ${sevenDaysAgo}
          AND NOT EXISTS (
            SELECT 1 FROM job_matches jm
            WHERE jm.job_id = j.id AND jm.user_id = ${userId}
          )
          AND NOT EXISTS (
            SELECT 1 FROM applications a
            WHERE a.job_id = j.id AND a.user_id = ${userId}
          )
      `.then(rows => Number(rows[0]?.count ?? 0)),
    ]);

    return NextResponse.json({
      count: pendingCount,
      total: totalCount,
      lastMatchAt: lastMatch?.createdAt ?? null,
      lastMatchScore: lastMatch?.matchScore != null ? Number(lastMatch.matchScore) : null,
      lastScrapedAt: lastScrapedJob?.scrapedAt ?? null,
      jobsLast24h,
      totalJobs,
      unmatchedJobs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    console.error('[match-job:count] error:', message);
    return NextResponse.json(
      { error: 'Failed to count matches', details: 'An unexpected error occurred while fetching match counts. Please try again.' },
      { status: 500 },
    );
  }
}
