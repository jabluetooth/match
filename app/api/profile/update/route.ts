import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const WORK_TYPES = ['remote', 'hybrid', 'onsite'] as const;

const profileSchema = z.object({
  base_resume_url: z.string().nullable().optional(),
  skills: z.array(z.string().min(1).max(100)).max(50).optional(),
  experience_years: z.number().int().min(0).max(80).nullable().optional(),
  job_titles: z.array(z.string().min(1).max(100)).max(20).optional(),
  industries: z.array(z.string().min(1).max(100)).max(20).optional(),
  min_salary: z.number().int().min(0).max(10_000_000).nullable().optional(),
  max_salary: z.number().int().min(0).max(10_000_000).nullable().optional(),
  preferred_locations: z.array(z.string().min(1).max(100)).max(20).optional(),
  work_type: z.enum(WORK_TYPES).nullable().optional(),
}).refine(
  (data) => {
    if (data.min_salary == null || data.max_salary == null) return true;
    return data.max_salary >= data.min_salary;
  },
  { message: 'Maximum salary must be greater than or equal to minimum salary.', path: ['max_salary'] },
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = profileSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const fields = {
      skills: data.skills ?? [],
      experienceYears: data.experience_years ?? null,
      jobTitles: data.job_titles ?? [],
      industries: data.industries ?? [],
      minSalary: data.min_salary ?? null,
      maxSalary: data.max_salary ?? null,
      preferredLocations: data.preferred_locations ?? [],
      workType: data.work_type ?? null,
    };

    const existingProfile = await prisma.userProfile.findFirst({ where: { userId } });

    const profile = existingProfile
      ? await prisma.userProfile.update({
          where: { id: existingProfile.id },
          data: {
            ...fields,
            // Only let the form clear the resume; uploads set it via /api/resume/upload.
            ...(data.base_resume_url === null ? { baseResumeUrl: null } : {}),
            updatedAt: new Date(),
          },
        })
      : await prisma.userProfile.create({
          data: {
            userId,
            baseResumeUrl: data.base_resume_url ?? null,
            ...fields,
          },
        });

    return NextResponse.json({ success: true, profile_id: profile.id });
  } catch (error: any) {
    console.error('[API] Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 },
    );
  }
}
