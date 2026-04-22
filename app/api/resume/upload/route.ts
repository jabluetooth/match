import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('user_id') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', details: 'Missing file in form data' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', details: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type', details: 'Only PDF, DOC, and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `resume_${userId}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const resumeUrl = `/uploads/resumes/${fileName}`;

    // Update user profile with resume URL
    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId },
    });

    if (existingProfile) {
      await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: {
          baseResumeUrl: resumeUrl,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.userProfile.create({
        data: {
          userId,
          baseResumeUrl: resumeUrl,
          skills: [],
          jobTitles: [],
          industries: [],
          preferredLocations: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      resume_url: resumeUrl,
      file_name: fileName,
      message: 'Resume uploaded successfully',
    });
  } catch (error: any) {
    console.error('[API] Resume upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload resume',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
