import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    const result = await n8nClient.matchJobs(user_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Job matching error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger job matching' },
      { status: 500 }
    );
  }
}
