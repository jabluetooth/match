import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { requireAuth } from '@/lib/auth';
import { MatchJobsSchema, validateAndSanitize } from '@/lib/validation';
import { prisma } from '@/lib/prisma';

/**
 * Triggers n8n's "match-job" workflow with a pre-flight check.
 *
 * The previous version blindly fired the webhook regardless of state, so when
 * the daily scrape failed or every active job had already been scored, the
 * user clicked the button, polled for 2 minutes, and got "Still scanning"
 * with no explanation. We now query the DB first; if there are no eligible
 * jobs to score, we return early with a structured `reason` the client can
 * surface as a useful toast.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json().catch(() => ({}));
    validateAndSanitize(MatchJobsSchema, { ...body, user_id: userId });

    // Pre-flight — same eligibility filter the n8n "Get New Jobs" SQL uses,
    // but with a 7-day window instead of "today only" to be tolerant of
    // missed scrape runs / first-time visitors after midnight.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [eligible, jobsLast24h, totalJobs, lastScrapedJob] = await Promise.all([
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
      prisma.job.count({
        where: { status: 'active', scrapedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
      prisma.job.count({ where: { status: 'active' } }),
      prisma.job.findFirst({
        where: { status: 'active' },
        orderBy: { scrapedAt: 'desc' },
        select: { scrapedAt: true },
      }),
    ]);

    if (eligible === 0) {
      // Distinguish "nothing scraped yet" vs "everything already scored."
      const reason =
        totalJobs === 0
          ? 'no_jobs_in_db'
          : jobsLast24h === 0
            ? 'no_recent_scrape'
            : 'all_jobs_already_matched';

      return NextResponse.json({
        success: true,
        triggered: false,
        reason,
        eligible,
        jobsLast24h,
        totalJobs,
        lastScrapedAt: lastScrapedJob?.scrapedAt ?? null,
      });
    }

    // We have something to match. Fire the n8n webhook. We deliberately don't
    // await for n8n's full response when it exceeds the client timeout —
    // n8n's `match-job` flow can take 30–90s. The webhook is configured to
    // respond as soon as it's queued.
    let triggerError: string | null = null;
    let n8nResult: unknown = null;
    try {
      n8nResult = await n8nClient.matchJobs(userId);
    } catch (err) {
      triggerError = err instanceof Error ? err.message : String(err);
      console.error('[match-job] n8n trigger failed:', triggerError);
    }

    return NextResponse.json({
      success: triggerError === null,
      triggered: triggerError === null,
      reason: triggerError ? 'n8n_unreachable' : 'matching_in_progress',
      eligible,
      jobsLast24h,
      totalJobs,
      lastScrapedAt: lastScrapedJob?.scrapedAt ?? null,
      n8n_error: triggerError,
      result: n8nResult,
    }, { status: triggerError ? 502 : 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unauthorized')) return NextResponse.json({ error: message }, { status: 401 });

    console.error('[match-job] error:', message);
    return NextResponse.json(
      { error: 'Failed to trigger job matching', details: message },
      { status: 500 },
    );
  }
}
