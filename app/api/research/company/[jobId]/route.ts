import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // 1. Authenticate user
    const userId = await requireAuth();

    // 2. Parse and validate jobId
    const { jobId: jobIdParam } = await params;
    const jobId = parseInt(jobIdParam);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // 3. Fetch company research for authenticated user
    const companyResearch = await prisma.companyResearch.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId, // Use authenticated user ID (string)
        },
      },
    });

    if (!companyResearch) {
      return NextResponse.json(
        { error: 'Company research not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(companyResearch);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unauthorized')) return NextResponse.json({ error: message }, { status: 401 });

    console.error('[company-research:get] error:', message);
    return NextResponse.json(
      { error: 'Failed to fetch company research', details: message },
      { status: 500 },
    );
  }
}
