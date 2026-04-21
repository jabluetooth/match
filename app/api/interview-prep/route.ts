import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';

/**
 * Interview Prep API
 * Generates a comprehensive interview preparation document
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, application_id, interviewer_name, interviewer_role, interviewer_linkedin_url } = body;

    console.log('[Interview Prep] Received:', { user_id, application_id, interviewer_name });

    // Validate required fields
    if (!user_id || !application_id) {
      return NextResponse.json(
        { error: 'user_id and application_id are required' },
        { status: 400 }
      );
    }

    // Call n8n workflow
    console.log('[Interview Prep] Triggering n8n workflow...');
    const result = await n8nClient.generateInterviewPrep({
      user_id,
      application_id,
      interviewer_name: interviewer_name || null,
      interviewer_role: interviewer_role || null,
      interviewer_linkedin_url: interviewer_linkedin_url || null,
    });

    console.log('[Interview Prep] Success:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Interview Prep] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview prep', details: error.message },
      { status: 500 }
    );
  }
}
