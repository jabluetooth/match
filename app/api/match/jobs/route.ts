import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { requireAuth } from '@/lib/auth';
import { MatchJobsSchema, validateAndSanitize } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await requireAuth();

    // 2. Validate input (even though we don't use body, we validate for consistency)
    const body = await request.json().catch(() => ({}));
    validateAndSanitize(MatchJobsSchema, {
      ...body,
      user_id: userId, // Override with authenticated user ID
    });

    // 3. Call n8n workflow with authenticated user ID
    const result = await n8nClient.matchJobs(userId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    // Handle authentication errors
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    console.error('Job matching error:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger job matching',
        details: error.message,
        hint: 'Check Vercel logs for [n8n] prefix to see the exact URL called.'
      },
      { status: 500 }
    );
  }
}
