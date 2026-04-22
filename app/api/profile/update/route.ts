import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      base_resume_url,
      skills,
      experience_years,
      job_titles,
      industries,
      min_salary,
      max_salary,
      preferred_locations,
      work_type,
    } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required', details: 'Missing user_id parameter' },
        { status: 400 }
      );
    }

    // Find existing profile
    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId: user_id },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: {
          baseResumeUrl: base_resume_url,
          skills: skills || [],
          experienceYears: experience_years,
          jobTitles: job_titles || [],
          industries: industries || [],
          minSalary: min_salary,
          maxSalary: max_salary,
          preferredLocations: preferred_locations || [],
          workType: work_type,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new profile
      profile = await prisma.userProfile.create({
        data: {
          userId: user_id,
          baseResumeUrl: base_resume_url,
          skills: skills || [],
          experienceYears: experience_years,
          jobTitles: job_titles || [],
          industries: industries || [],
          minSalary: min_salary,
          maxSalary: max_salary,
          preferredLocations: preferred_locations || [],
          workType: work_type,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile_id: profile.id,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('[API] Profile update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
