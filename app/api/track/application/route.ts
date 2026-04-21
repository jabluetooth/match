import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { n8nClient } from '@/lib/n8n-client';
import { requireAuth, verifyOwnership } from '@/lib/auth';
import { ApplicationTrackerSchema, validateAndSanitize } from '@/lib/validation';

// This endpoint handles application tracking and optionally triggers n8n workflow
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await requireAuth();

    const body = await request.json();

    // 2. Validate and sanitize input
    const validated = validateAndSanitize(ApplicationTrackerSchema, {
      ...body,
      user_id: userId, // Override with authenticated user ID
    });

    const { action, job_id, application_id, status, interview_date, interview_location, interview_type, interviewer_name, interviewer_role, notes } = validated;
    const trigger_n8n = body.trigger_n8n !== undefined ? body.trigger_n8n : false;

    console.log('[Application Tracker] Received:', { action, user_id: userId, job_id, application_id, status });

    let result;

    if (action === 'create') {
      // 3. Create new application
      if (!job_id) {
        return NextResponse.json({ error: 'job_id is required for create action' }, { status: 400 });
      }

      // Check if application already exists for this user
      const existingApp = await prisma.application.findFirst({
        where: { userId, jobId: job_id }
      });

      if (existingApp) {
        return NextResponse.json(
          { error: 'Application already exists for this job', application_id: existingApp.id },
          { status: 409 }
        );
      }

      // Create application with authenticated user ID
      result = await prisma.application.create({
        data: {
          userId, // Use authenticated user ID
          jobId: job_id,
          status: status || 'interested',
          notes,
        },
        include: {
          job: true,
          user: true,
        }
      });

    } else if (action === 'update_status') {
      // 4. Update application status
      if (!application_id) {
        return NextResponse.json({ error: 'application_id is required for update_status action' }, { status: 400 });
      }

      if (!status) {
        return NextResponse.json({ error: 'status is required for update_status action' }, { status: 400 });
      }

      // Verify ownership before updating
      const currentApp = await prisma.application.findUnique({
        where: { id: application_id },
        select: { userId: true, appliedAt: true }
      });

      if (!currentApp) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }

      await verifyOwnership(currentApp.userId);

      // Update application
      result = await prisma.application.update({
        where: { id: application_id },
        data: {
          status,
          ...(notes && { notes }),
          ...((status === 'applied') && !currentApp.appliedAt && { appliedAt: new Date() }),
        },
        include: {
          job: true,
          user: true,
        }
      });

    } else if (action === 'schedule_interview') {
      // 5. Schedule interview
      if (!application_id) {
        return NextResponse.json({ error: 'application_id is required for schedule_interview action' }, { status: 400 });
      }

      if (!interview_date) {
        return NextResponse.json({ error: 'interview_date is required for schedule_interview action' }, { status: 400 });
      }

      // Verify ownership before updating
      const application = await prisma.application.findUnique({
        where: { id: application_id },
        select: { userId: true }
      });

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }

      await verifyOwnership(application.userId);

      // Update application with interview details
      result = await prisma.application.update({
        where: { id: application_id },
        data: {
          status: 'interview',
          interviewDate: new Date(interview_date),
          interviewType: interview_type || 'video',
          interviewLocation: interview_location,
          interviewerName: interviewer_name,
          interviewerRole: interviewer_role,
        },
        include: {
          job: true,
          user: true,
        }
      });
    }

    if (!result) {
      return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }

    // 6. Optionally trigger n8n workflow for email notifications and additional processing
    if (trigger_n8n) {
      try {
        console.log('[Application Tracker] Triggering n8n workflow...');
        await n8nClient.trackApplication({
          action,
          user_id: userId, // Use authenticated user ID
          job_id,
          application_id: result.id,
          status: result.status,
          interview_date,
          interview_type,
          interview_location,
          interviewer_name,
          interviewer_role,
          notes,
        });
        console.log('[Application Tracker] n8n workflow triggered successfully');
      } catch (n8nError: any) {
        console.error('[Application Tracker] n8n trigger failed:', n8nError.message);
        // Don't fail the request if n8n fails - database update already succeeded
      }
    }

    // 7. Build response compatible with n8n workflow
    const response = {
      status: 'success',
      action,
      application_id: result.id,
      application_status: result.status,
      job_title: result.job.title,
      company: result.job.companyName,
      interview_date: result.interviewDate || null,
      email_sent: trigger_n8n, // Emails sent via n8n if triggered
    };

    console.log('[Application Tracker] Success:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    // Handle authentication/authorization errors
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }

    console.error('[Application Tracker] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process application action', details: error.message },
      { status: 500 }
    );
  }
}
