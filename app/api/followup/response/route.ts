import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { n8nClient } from '@/lib/n8n-client';
import { requireAuth, verifyOwnership } from '@/lib/auth';
import { FollowUpResponseSchema, validateAndSanitize } from '@/lib/validation';

/**
 * Logs a follow-up response (replied / no_response / bounced), updates the
 * application status if a reply advances the funnel, recomputes the user's
 * response-rate stat, and optionally fans out to the n8n workflow.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    const validated = validateAndSanitize(FollowUpResponseSchema, {
      ...body,
      user_id: userId,
    });

    const followUpCheck = await prisma.followUpLog.findUnique({
      where: { id: validated.followup_id },
      select: { userId: true },
    });

    if (!followUpCheck) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
    }

    await verifyOwnership(followUpCheck.userId);

    await prisma.followUpLog.update({
      where: { id: validated.followup_id },
      data: {
        responseStatus: validated.response_status,
        ...(validated.response_status === 'replied' && { respondedAt: new Date() }),
      },
    });

    // If replied, advance application status from "applied" → "phone_screen".
    if (validated.response_status === 'replied') {
      const currentApp = await prisma.application.findUnique({
        where: { id: validated.application_id },
        select: { status: true, userId: true },
      });
      if (currentApp?.userId === userId && currentApp.status === 'applied') {
        await prisma.application.update({
          where: { id: validated.application_id },
          data: { status: 'phone_screen' },
        });
      }
    }

    const [totalFollowUps, repliedFollowUps] = await Promise.all([
      prisma.followUpLog.count({ where: { userId } }),
      prisma.followUpLog.count({ where: { userId, responseStatus: 'replied' } }),
    ]);

    const responseRatePct = totalFollowUps > 0
      ? Math.round((repliedFollowUps / totalFollowUps) * 1000) / 10
      : 0;

    if (validated.trigger_n8n) {
      try {
        await n8nClient.trackFollowUpResponse({
          followup_id: validated.followup_id,
          application_id: validated.application_id,
          user_id: userId,
          response_status: validated.response_status,
        });
      } catch (n8nError: unknown) {
        console.error('[followup-response] n8n trigger failed:', n8nError instanceof Error ? n8nError.message : n8nError);
      }
    }

    return NextResponse.json({
      status: 'success',
      followup_id: validated.followup_id,
      application_id: validated.application_id,
      response_status: validated.response_status,
      response_rate_pct: responseRatePct,
      total_sent: totalFollowUps,
      total_replied: repliedFollowUps,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    console.error('[followup-response] error:', message);
    return NextResponse.json(
      { error: 'Failed to process follow-up response', details: message },
      { status: 500 },
    );
  }
}
