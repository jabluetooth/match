import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { n8nClient } from '@/lib/n8n-client';

const prisma = new PrismaClient();

/**
 * Follow-up Response Tracking API
 * Handles when a candidate receives a reply or marks a follow-up as unanswered
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followup_id, application_id, user_id, response_status, trigger_n8n = true } = body;

    console.log('[Follow-up Response] Received:', { followup_id, application_id, user_id, response_status });

    // Validate required fields
    if (!followup_id) {
      return NextResponse.json({ errorMessage: 'Missing followup_id' }, { status: 500 });
    }

    if (!application_id) {
      return NextResponse.json({ errorMessage: 'Missing application_id' }, { status: 500 });
    }

    if (!user_id) {
      return NextResponse.json({ errorMessage: 'Missing user_id' }, { status: 500 });
    }

    // Validate response_status
    const validStatuses = ['replied', 'no_response', 'bounced'];
    if (!response_status || !validStatuses.includes(response_status)) {
      return NextResponse.json(
        { errorMessage: `response_status must be one of: ${validStatuses.join(', ')}` },
        { status: 500 }
      );
    }

    // Update follow-up record
    const followUp = await prisma.followUpLog.update({
      where: { id: followup_id },
      data: {
        responseStatus: response_status,
        // Set respondedAt when replied
        ...(response_status === 'replied' && { respondedAt: new Date() }),
      },
    });

    console.log('[Follow-up Response] Updated follow-up:', followUp.id);

    // If replied, advance application status from "applied" to "phone_screen"
    let application = null;
    if (response_status === 'replied') {
      const currentApp = await prisma.application.findUnique({
        where: { id: application_id },
        include: { job: true }
      });

      // Only advance if still at "applied" status
      if (currentApp?.status === 'applied') {
        application = await prisma.application.update({
          where: { id: application_id },
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
      where: {
        userId: user_id,
        sentAt: { not: null }, // Only count sent follow-ups
      }
    });

    const repliedFollowUps = await prisma.followUpLog.count({
      where: {
        userId: user_id,
        responseStatus: 'replied',
      }
    });

    const responseRatePct = totalFollowUps > 0
      ? Math.round((repliedFollowUps / totalFollowUps) * 1000) / 10
      : 0;

    // Optionally trigger n8n workflow
    if (trigger_n8n) {
      try {
        console.log('[Follow-up Response] Triggering n8n workflow...');
        await n8nClient.trackFollowUpResponse({
          followup_id,
          application_id,
          user_id,
          response_status,
        });
        console.log('[Follow-up Response] n8n workflow triggered successfully');
      } catch (n8nError: any) {
        console.error('[Follow-up Response] n8n trigger failed:', n8nError.message);
        // Don't fail the request if n8n fails - database update already succeeded
      }
    }

    // Build response matching the workflow spec
    const response = {
      status: 'success',
      followup_id,
      application_id,
      response_status,
      response_rate_pct: responseRatePct,
      total_sent: totalFollowUps,
      total_replied: repliedFollowUps,
    };

    console.log('[Follow-up Response] Success:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Follow-up Response] Error:', error);
    return NextResponse.json(
      { errorMessage: error.message || 'Failed to process follow-up response' },
      { status: 500 }
    );
  }
}
