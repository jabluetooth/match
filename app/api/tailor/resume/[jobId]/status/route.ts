import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const userId = await requireAuth();
  const { jobId: jobIdStr } = await params;
  const jobId = parseInt(jobIdStr);

  if (isNaN(jobId)) {
    return NextResponse.json({ ready: false, exists: false }, { status: 400 });
  }

  const resume = await prisma.tailoredResume.findFirst({
    where: { userId, jobId },
    orderBy: { version: 'desc' },
    select: { id: true, htmlContent: true },
  });

  return NextResponse.json({
    ready: !!resume?.htmlContent,
    exists: !!resume,
  });
}
