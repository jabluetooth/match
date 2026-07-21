import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Constant-time string comparison. Guards the length check before calling
 * `timingSafeEqual` (which throws on mismatched buffer lengths) so a length
 * mismatch can't leak timing information either.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Server-to-server endpoint used by n8n to fetch a user's original (base)
 * resume bytes. Authenticates with a shared secret in the
 * `x-webhook-secret` header — set `N8N_WEBHOOK_SECRET` on Vercel and on the
 * n8n workflow's HTTP Request node.
 *
 * Resume bytes live in user_profiles (see resume_blob_columns.sql), so they
 * aren't reachable via any public URL — this is the only way for n8n to
 * read the original resume when tailoring while preserving format.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Server misconfigured', details: 'N8N_WEBHOOK_SECRET not set.' },
      { status: 500 },
    );
  }

  const provided = request.headers.get('x-webhook-secret');
  if (!provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const profile = await prisma.userProfile.findFirst({
    where: { userId },
    select: {
      baseResumeData: true,
      baseResumeName: true,
      baseResumeContentType: true,
      baseResumeSize: true,
      baseResumeUploadedAt: true,
    },
  });

  if (!profile?.baseResumeData) {
    return NextResponse.json({ error: 'No resume on file for user' }, { status: 404 });
  }

  // Two response shapes — pick via ?format=json (metadata + base64) or
  // default to streaming the binary. n8n typically wants binary so it can
  // feed the bytes into the AI prompt / a parser node.
  const url = new URL(request.url);
  const wantsJson = url.searchParams.get('format') === 'json';

  const buffer = Buffer.from(profile.baseResumeData);

  if (wantsJson) {
    return NextResponse.json({
      file_name: profile.baseResumeName,
      content_type: profile.baseResumeContentType,
      size: profile.baseResumeSize,
      uploaded_at: profile.baseResumeUploadedAt,
      data_base64: buffer.toString('base64'),
    });
  }

  const fileName = (profile.baseResumeName ?? 'resume').replace(/[\r\n"\\]/g, '_');
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': profile.baseResumeContentType ?? 'application/octet-stream',
      'Content-Length': String(buffer.byteLength),
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
