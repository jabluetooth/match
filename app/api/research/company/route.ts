import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { requireAuth, verifyOwnership } from '@/lib/auth';
import { CompanyResearchSchema, validateAndSanitize } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit, RateLimitError } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await requireAuth();

    await enforceRateLimit(userId, 'research_company', { windowMs: 10 * 60 * 1000, max: 5 });

    const body = await request.json();

    // 2. Validate and sanitize input
    const validated = validateAndSanitize(CompanyResearchSchema, {
      ...body,
      user_id: userId, // Override with authenticated user ID
    });

    // 3. Verify ownership if application_id is provided
    if (validated.application_id) {
      const application = await prisma.application.findUnique({
        where: { id: validated.application_id },
        select: { userId: true }
      });

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }

      await verifyOwnership(application.userId);
    }

    // 4. Ensure either application_id or job_id is provided
    if (!validated.application_id && !validated.job_id) {
      return NextResponse.json(
        { error: 'Either application_id or job_id is required' },
        { status: 400 }
      );
    }

    const result = await n8nClient.researchCompany({
      user_id: userId,
      application_id: validated.application_id,
      job_id: validated.job_id,
    });

    // n8n runs the workflow end-to-end but the "Save Research to DB" node
    // is known to silently rollback when its SQL doesn't match the schema
    // (see PHASES.md item 6.1). If research_id is missing, log what we got
    // so the client toast and the server log are both actionable.
    const hasResearchId =
      result && typeof result === 'object' &&
      'research_id' in (result as Record<string, unknown>);
    if (!hasResearchId) {
      console.error('[company-research] n8n returned no research_id — DB save likely failed silently. Payload:', result);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests. Please wait a few minutes and try again.' }, { status: 429 });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unauthorized')) return NextResponse.json({ error: message }, { status: 401 });
    if (message.includes('Forbidden')) return NextResponse.json({ error: message }, { status: 403 });

    console.error('[company-research] error:', message);
    return NextResponse.json(
      { error: 'Failed to trigger company research', details: 'An unexpected error occurred while starting company research. Please try again.' },
      { status: 500 },
    );
  }
}
