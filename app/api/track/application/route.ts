import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { n8nClient } from '@/lib/n8n-client';

const prisma = new PrismaClient();

// This endpoint handles application tracking and optionally triggers n8n workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, user_id, job_id, application_id, status, interview_date, interview_location, interview_type, interviewer_name, interviewer_role, notes, trigger_n8n = false } = body;

    console.log('[Application Tracker] Received:', { action, user_id, job_id, application_id, status });

    // Validate action
    const validActions = ['create', 'update_status', 'schedule_interview'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    let result;

    if (action === 'create') {
      // Create new application
      if (!job_id) {
        return NextResponse.json({ error: 'job_id is required for create action' }, { status: 400 });
      }

      // First, find or create job match
      let jobMatch = await prisma.jobMatch.findFirst({
        where: { jobId: job_id, userId: user_id }
      });

      if (!jobMatch) {
        jobMatch = await prisma.jobMatch.create({
          data: {
            userId: user_id,
            jobId: job_id,
            matchScore: 0,
            aiReasoning: 'Manual application',
            skillsMatched: [],
            skillsMissing: [],
            status: 'interested',
          }
        });
      }

      // Create application
      result = await prisma.application.create({
        data: {
          userId: user_id,
          jobMatchId: jobMatch.id,
          status: status || 'draft',
          notes,
        },
        include: {
          jobMatch: {
            include: { job: true }
          },
          user: true,
        }
      });

    } else if (action === 'update_status') {
      // Update application status
      if (!application_id) {
        return NextResponse.json({ error: 'application_id is required for update_status action' }, { status: 400 });
      }

      if (!status) {
        return NextResponse.json({ error: 'status is required for update_status action' }, { status: 400 });
      }

      // First, get the current application to check appliedDate
      const currentApp = await prisma.application.findUnique({
        where: { id: application_id }
      });

      result = await prisma.application.update({
        where: { id: application_id },
        data: {
          status,
          ...(notes && { notes }),
          ...((status === 'submitted' || status === 'applied') && !currentApp?.appliedDate && { appliedDate: new Date() }),
        },
        include: {
          jobMatch: {
            include: { job: true }
          },
          user: true,
        }
      });

    } else if (action === 'schedule_interview') {
      // Schedule interview
      if (!application_id) {
        return NextResponse.json({ error: 'application_id is required for schedule_interview action' }, { status: 400 });
      }

      if (!interview_date) {
        return NextResponse.json({ error: 'interview_date is required for schedule_interview action' }, { status: 400 });
      }

      // Create interview record
      const interview = await prisma.interview.create({
        data: {
          applicationId: application_id,
          scheduledDate: new Date(interview_date),
          interviewType: interview_type || 'video',
          location: interview_location,
          interviewerName: interviewer_name,
          interviewerTitle: interviewer_role,
          status: 'scheduled',
        }
      });

      // Update application status to interview
      result = await prisma.application.update({
        where: { id: application_id },
        data: {
          status: 'interview',
        },
        include: {
          jobMatch: {
            include: { job: true }
          },
          user: true,
          interviews: true,
        }
      });

      result = { ...result, interview };
    }

    if (!result) {
      return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }

    // Optionally trigger n8n workflow for email notifications and additional processing
    if (trigger_n8n) {
      try {
        console.log('[Application Tracker] Triggering n8n workflow...');
        await n8nClient.trackApplication({
          action,
          user_id,
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

    // Build response compatible with n8n workflow
    const response = {
      status: 'success',
      action,
      application_id: result.id,
      application_status: result.status,
      job_title: result.jobMatch.job.title,
      company: result.jobMatch.job.companyName,
      interview_date: result.interviews?.[0]?.scheduledDate || null,
      email_sent: trigger_n8n, // Emails sent via n8n if triggered
    };

    console.log('[Application Tracker] Success:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Application Tracker] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process application action', details: error.message },
      { status: 500 }
    );
  }
}
