import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { requireAuth, verifyOwnership } from '@/lib/auth';
import { InterviewPrepSchema, validateAndSanitize } from '@/lib/validation';
import { prisma } from '@/lib/prisma';

/**
 * Interview Prep API
 * Generates a comprehensive interview preparation document
 *
 * SECURITY: Requires authentication, validates ownership
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await requireAuth();

    const body = await request.json();

    // Validate and sanitize input
    const validated = validateAndSanitize(InterviewPrepSchema, {
      ...body,
      user_id: userId, // Override with authenticated user ID
    });

    console.log('[Interview Prep] Received:', {
      userId,
      applicationId: validated.application_id
    });

    // Verify user owns the application
    const application = await prisma.application.findUnique({
      where: { id: validated.application_id },
      select: { userId: true }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    await verifyOwnership(application.userId);

    // Call n8n workflow
    console.log('[Interview Prep] Triggering n8n workflow...');
    const result = await n8nClient.generateInterviewPrep({
      user_id: userId,
      application_id: validated.application_id,
      interviewer_name: validated.interviewer_name || null,
      interviewer_role: validated.interviewer_role || null,
      interviewer_linkedin_url: validated.interviewer_linkedin_url || null,
    });

    console.log('[Interview Prep] Success');

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Interview Prep] Error:', error);

    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate interview prep', details: error.message },
      { status: 500 }
    );
  }
}
