import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/**
 * Streams the authenticated user's base resume from disk.
 *
 * Returns 404 if no resume is on file or the file is missing on disk.
 * The file is always served with Content-Disposition: inline so it opens
 * in the browser tab instead of forcing a download.
 *
 * NOTE: storage is local-disk under public/uploads/resumes. This works
 * for `next dev` but not on serverless filesystems (Vercel). When wiring
 * up Vercel Blob / S3 for production, swap the disk read here for a
 * fetch + signed-URL redirect.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.userProfile.findFirst({ where: { userId } });
  if (!profile?.baseResumeUrl) {
    return NextResponse.json({ error: 'No resume on file' }, { status: 404 });
  }

  const storedUrl = profile.baseResumeUrl;
  const baseName = path.basename(storedUrl);
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
  const filePath = path.join(uploadsDir, baseName);

  // Guard against path traversal — resolved path must stay inside uploadsDir.
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(uploadsDir) + path.sep)) {
    return NextResponse.json({ error: 'Invalid resume path' }, { status: 400 });
  }

  try {
    await stat(resolved);
  } catch {
    return NextResponse.json(
      { error: 'Resume file missing', details: 'The stored file is not available. Please re-upload your resume.' },
      { status: 404 },
    );
  }

  const ext = path.extname(baseName).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream';
  const buffer = await readFile(resolved);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(buffer.byteLength),
      'Content-Disposition': `inline; filename="${baseName}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
