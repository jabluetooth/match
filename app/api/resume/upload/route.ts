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

    // `userId` is @unique on UserProfile (migrated onto the live DB), so this
    // upsert is race-safe against two concurrent uploads for the same user —
    // unlike findFirst + conditional create/update, which had a window where
    // both requests could see "no existing profile" and both insert a row.
    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        baseResumeUrl: viewUrl,
        baseResumeData: bytes,
        baseResumeName: safeName,
        baseResumeContentType: file.type,
        baseResumeSize: file.size,
        baseResumeUploadedAt: uploadedAt,
        updatedAt: uploadedAt,
      },
      create: {
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
