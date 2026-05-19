import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Returns the current number of pending job matches for the authenticated user.
 * Used by the "Find New Matches" button to poll for completion of the n8n
 * matching workflow (matches arrive asynchronously).
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    const count = await prisma.jobMatch.count({
      where: { userId, status: 'pending' },
    });
    return NextResponse.json({ count });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to count matches', details: message }, { status: 500 });
  }
}
