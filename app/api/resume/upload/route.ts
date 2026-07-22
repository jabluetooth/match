import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { matchesFileSignature } from '@/lib/file-signatures';

// 5 MB. Matches the client-side cap in components/settings-form.tsx. The body
// also stays under Vercel's serverless request size limit on Hobby (4.5 MB)
// and Pro (50 MB) — the writable filesystem path /tmp would let us go larger,
// but the DB-row approach below sidesteps that entirely.
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided', details: 'Form field "file" is missing or invalid.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'File too large', details: `Max ${Math.round(MAX_BYTES / 1024 / 1024)} MB.` },
        { status: 413 },
      );
    }

    const expectedExt = ALLOWED_TYPES[file.type];
    if (!expectedExt) {
      return NextResponse.json(
        { error: 'Invalid file type', details: 'Only PDF, DOC, and DOCX are accepted.' },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    if (!matchesFileSignature(bytes, file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type', details: 'The file contents do not match the declared file type.' },
        { status: 400 },
      );
    }

    const safeName = file.name.replace(/[\r\n"\\]/g, '_').slice(0, 255);
    const uploadedAt = new Date();

    // viewUrl is what the rest of the app reads. Keep it as the API path so
    // existing references (settings card, n8n templates) keep working.
    const viewUrl = '/api/resume/file';

    // NOTE: `userId` is declared @unique on UserProfile in schema.prisma, but
    // that constraint has not been migrated onto the live DB yet (tracked
    // separately — the live DB currently has pre-existing duplicate rows for
    // at least one user, which must be resolved before the migration can even
    // run, since Postgres can't build a unique index over duplicate values).
    // An upsert() with `where: { userId }` assumes the constraint exists and
    // fails outright without it ("no unique or exclusion constraint matching
    // the ON CONFLICT specification"), so we're back to findFirst + branch
    // until the migration lands. `orderBy: updatedAt desc` at least makes the
    // duplicate-row case deterministic (most-recently-edited profile wins)
    // instead of depending on undefined Postgres scan order.
    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (existingProfile) {
      await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: {
          baseResumeUrl: viewUrl,
          baseResumeData: bytes,
          baseResumeName: safeName,
          baseResumeContentType: file.type,
          baseResumeSize: file.size,
          baseResumeUploadedAt: uploadedAt,
          updatedAt: uploadedAt,
        },
      });
    } else {
      await prisma.userProfile.create({
        data: {
          userId,
          baseResumeUrl: viewUrl,
          baseResumeData: bytes,
          baseResumeName: safeName,
          baseResumeContentType: file.type,
          baseResumeSize: file.size,
          baseResumeUploadedAt: uploadedAt,
          skills: [],
          jobTitles: [],
          industries: [],
          preferredLocations: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      resume_url: viewUrl,
      view_url: viewUrl,
      file_name: safeName,
      size: file.size,
      content_type: file.type,
    });
  } catch (error: any) {
    console.error('[API] Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume', details: 'An unexpected error occurred while uploading your resume. Please try again.' },
      { status: 500 },
    );
  }
}
