import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, application_id, job_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (!application_id && !job_id) {
      return NextResponse.json(
        { error: 'Either application_id or job_id is required' },
        { status: 400 }
      );
    }

    const result = await n8nClient.researchCompany({
      user_id,
      application_id,
      job_id,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Company research error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to trigger company research',
        details: error.message,
        hint: 'Check Vercel logs for [n8n] prefix.'
      },
      { status: 500 }
    );
  }
}
