import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { n8nClient } from '@/lib/n8n-client';
import { requireAuth, verifyOwnership } from '@/lib/auth';
import { FollowUpResponseSchema, validateAndSanitize } from '@/lib/validation';

/**
 * Follow-up Response Tracking API
 * Handles when a candidate receives a reply or marks a follow-up as unanswered
 *
 * SECURITY: Requires authentication, validates ownership
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await requireAuth();

    const body = await request.json();

    // Validate and sanitize input
    const validated = validateAndSanitize(FollowUpResponseSchema, {
      ...body,
      user_id: userId, // Override with authenticated user ID
    });

    console.log('[Follow-up Response] Received:', {
      userId,
      followupId: validated.followup_id,
      responseStatus: validated.response_status
    });

    // Verify user owns the follow-up
    const followUpCheck = await prisma.followUpLog.findUnique({
      where: { id: validated.followup_id },
      select: { userId: true }
    });

    if (!followUpCheck) {
      return NextResponse.json(
        { errorMessage: 'Follow-up not found' },
        { status: 404 }
      );
    }

    await verifyOwnership(followUpCheck.userId);

    // Update follow-up record
    const followUp = await prisma.followUpLog.update({
      where: { id: validated.followup_id },
      data: {
        responseStatus: validated.response_status,
        ...(validated.response_status === 'replied' && { respondedAt: new Date() }),
      },
    });

    console.log('[Follow-up Response] Updated follow-up:', followUp.id);

    // If replied, advance application status from "applied" to "phone_screen"
    let application = null;
    if (validated.response_status === 'replied') {
      const currentApp = await prisma.application.findUnique({
        where: { id: validated.application_id },
        include: { job: true }
      });

      if (currentApp?.status === 'applied') {
        application = await prisma.application.update({
          where: { id: validated.application_id },
          data: { status: 'phone_screen' },
          include: { job: true }
        });
        console.log('[Follow-up Response] Advanced application to phone_screen');
      } else {
        application = currentApp;
      }
    }

    // Calculate response rate statistics
    const totalFollowUps = await prisma.followUpLog.count({
      where: { userId }
    });

    const repliedFollowUps = await prisma.followUpLog.count({
      where: {
        userId,
        responseStatus: 'replied',
      }
    });

    const responseRatePct = totalFollowUps > 0
      ? Math.round((repliedFollowUps / totalFollowUps) * 1000) / 10
      : 0;

    // Optionally trigger n8n workflow
    if (validated.trigger_n8n) {
      try {
        console.log('[Follow-up Response] Triggering n8n workflow...');
        await n8nClient.trackFollowUpResponse({
          followup_id: validated.followup_id,
          application_id: validated.application_id,
          user_id: userId,
          response_status: validated.response_status,
        });
        console.log('[Follow-up Response] n8n workflow triggered successfully');
      } catch (n8nError: any) {
        console.error('[Follow-up Response] n8n trigger failed:', n8nError.message);
      }
    }

    const response = {
      status: 'success',
      followup_id: validated.followup_id,
      application_id: validated.application_id,
      response_status: validated.response_status,
      response_rate_pct: responseRatePct,
      total_sent: totalFollowUps,
      total_replied: repliedFollowUps,
    };

    console.log('[Follow-up Response] Success');

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Follow-up Response] Error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { errorMessage: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }

    return NextResponse.json(
      { errorMessage: error.message || 'Failed to process follow-up response' },
      { status: 500 }
    );
  }
}
