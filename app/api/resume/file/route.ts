import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * Streams the authenticated user's base resume from the user_profiles row.
 *
 * Resume bytes live in the DB (see prisma/migrations/resume_blob_columns.sql)
 * so this works on Vercel's read-only serverless filesystem. Served as an
 * attachment (forced download) rather than inline — no reason to render a
 * resume in-browser, and this closes off any theoretical content-sniffing
 * risk from a spoofed content-type. Cache-Control is private + no-store
 * because the file is per-user.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.userProfile.findFirst({
    where: { userId },
    select: {
      baseResumeData: true,
      baseResumeName: true,
      baseResumeContentType: true,
    },
  });

  if (!profile?.baseResumeData) {
    return NextResponse.json({ error: 'No resume on file' }, { status: 404 });
  }

  const fileName = (profile.baseResumeName ?? 'resume').replace(/[\r\n"\\]/g, '_');
  const contentType = profile.baseResumeContentType ?? 'application/octet-stream';
  const buffer = Buffer.from(profile.baseResumeData);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(buffer.byteLength),
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
