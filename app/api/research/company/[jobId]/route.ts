import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId: jobIdParam } = await params;
    const jobId = parseInt(jobIdParam);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Get user_id from query params (in a real app, this would come from auth)
    const userId = request.nextUrl.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const companyResearch = await prisma.companyResearch.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: parseInt(userId),
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
  } catch (error: any) {
    console.error('Failed to fetch company research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company research', details: error.message },
      { status: 500 }
    );
  }
}
