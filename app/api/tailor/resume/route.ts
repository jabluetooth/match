import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { requireAuth } from '@/lib/auth';
import { TailorResumeSchema, validateAndSanitize } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await requireAuth();

    const body = await request.json();

    // 2. Validate and sanitize input
    const validated = validateAndSanitize(TailorResumeSchema, {
      ...body,
      user_id: userId, // Override with authenticated user ID
    });

    const result = await n8nClient.tailorResume({
      user_id: userId,
      job_id: validated.job_id,
    });
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unauthorized')) return NextResponse.json({ error: message }, { status: 401 });

    console.error('[tailor-resume] error:', message);
    return NextResponse.json(
      { error: 'Failed to trigger resume tailoring', details: message },
      { status: 500 },
    );
  }
}
