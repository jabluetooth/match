import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, verifyOwnership } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const applicationIdParam = request.nextUrl.searchParams.get('application_id');
    const where: Prisma.InterviewWhereInput = {};

    if (applicationIdParam) {
      const applicationId = parseInt(applicationIdParam, 10);
      if (Number.isNaN(applicationId)) {
        return NextResponse.json({ error: 'Invalid application_id' }, { status: 400 });
      }

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        select: { userId: true },
      });

      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      await verifyOwnership(application.userId);

      where.applicationId = applicationId;
    } else {
      // Interview has no Prisma relation back to Application — fan out via IDs.
      const userAppIds = await prisma.application.findMany({
        where: { userId },
        select: { id: true },
      });
      where.applicationId = { in: userAppIds.map((a) => a.id) };
    }

    const interviews = await prisma.interview.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json(interviews);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unauthorized')) return NextResponse.json({ error: message }, { status: 401 });
    if (message.includes('Forbidden')) return NextResponse.json({ error: message }, { status: 403 });

    console.error('[interviews] error:', message);
    return NextResponse.json(
      { error: 'Failed to fetch interviews', details: message },
      { status: 500 },
    );
  }
}
