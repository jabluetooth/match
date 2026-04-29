import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, verifyOwnership } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await requireAuth();

    // 2. Get optional application_id filter
    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get('application_id');

    const where: any = {};

    if (applicationId) {
      // If filtering by specific application, verify ownership
      const application = await prisma.application.findUnique({
        where: { id: parseInt(applicationId) },
        select: { userId: true }
      });

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }

      await verifyOwnership(application.userId);

      where.applicationId = parseInt(applicationId);
    } else {
      // Get all interviews for authenticated user's applications
      where.application = {
        userId // Use authenticated user ID (string)
      };
    }

    // 3. Fetch interviews
    const interviews = await prisma.interview.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json(interviews);

  } catch (error: any) {
    // Handle authentication/authorization errors
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }

    console.error('[Interviews API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews', details: error.message },
      { status: 500 }
    );
  }
}
