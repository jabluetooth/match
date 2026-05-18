import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findFirst({ where: { userId } });
    if (!profile?.baseResumeUrl) {
      return NextResponse.json({ success: true, removed: false });
    }

    const baseName = path.basename(profile.baseResumeUrl);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    const filePath = path.resolve(path.join(uploadsDir, baseName));

    if (filePath.startsWith(path.resolve(uploadsDir) + path.sep)) {
      // Best-effort unlink — never block clearing the DB pointer on disk errors.
      try { await unlink(filePath); } catch { /* file may already be missing */ }
    }

    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { baseResumeUrl: null, updatedAt: new Date() },
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
