import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
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

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Filename uses authenticated userId, never any client-supplied value.
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `resume_${safeUserId}_${Date.now()}${expectedExt}`;
    const filePath = path.join(uploadsDir, fileName);

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    const storedUrl = `/uploads/resumes/${fileName}`;
    const viewUrl = '/api/resume/file';

    const existingProfile = await prisma.userProfile.findFirst({ where: { userId } });

    if (existingProfile) {
      await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: { baseResumeUrl: storedUrl, updatedAt: new Date() },
      });
    } else {
      await prisma.userProfile.create({
        data: {
          userId,
          baseResumeUrl: storedUrl,
          skills: [],
          jobTitles: [],
          industries: [],
          preferredLocations: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      resume_url: storedUrl,
      view_url: viewUrl,
      file_name: file.name,
      stored_as: fileName,
      size: file.size,
      content_type: file.type,
    });
  } catch (error: any) {
    console.error('[API] Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume', details: error.message },
      { status: 500 },
    );
  }
}
