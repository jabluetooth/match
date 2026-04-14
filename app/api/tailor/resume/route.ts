import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, job_id } = body;

    if (!user_id || !job_id) {
      return NextResponse.json(
        { error: 'user_id and job_id are required' },
        { status: 400 }
      );
    }

    const result = await n8nClient.tailorResume({
      user_id,
      job_id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Resume tailor error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger resume tailoring' },
      { status: 500 }
    );
  }
}
