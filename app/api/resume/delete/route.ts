import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findFirst({ where: { userId } });
    if (!profile?.baseResumeUrl && !profile?.baseResumeData) {
      return NextResponse.json({ success: true, removed: false });
    }

    await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        baseResumeUrl: null,
        baseResumeData: null,
        baseResumeName: null,
        baseResumeContentType: null,
        baseResumeSize: null,
        baseResumeUploadedAt: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, removed: true });
  } catch (error: any) {
    console.error('[API] Resume delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove resume', details: error.message },
      { status: 500 },
    );
  }
}
