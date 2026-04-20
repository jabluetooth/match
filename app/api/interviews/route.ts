import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const applicationId = searchParams.get('application_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const where: any = {};

    if (applicationId) {
      where.applicationId = parseInt(applicationId);
    } else {
      // Get all interviews for user's applications
      where.application = {
        userId: parseInt(userId)
      };
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            jobMatch: {
              include: {
                job: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    return NextResponse.json(interviews);

  } catch (error: any) {
    console.error('[Interviews API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews', details: error.message },
      { status: 500 }
    );
  }
}
