import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit, RateLimitError } from '@/lib/rate-limit';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const userId = await requireAuth();
    const { jobId: jobIdStr } = await params;
    const jobId = parseInt(jobIdStr, 10);

    if (Number.isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    // This route calls PDFShift's paid conversion API per request.
    await enforceRateLimit(userId, 'tailor_resume_download', { windowMs: 10 * 60 * 1000, max: 10 });

    const resume = await prisma.tailoredResume.findFirst({
      where: { userId, jobId },
      orderBy: { version: 'desc' },
      select: { htmlContent: true, pdfFilename: true },
    });

    if (!resume?.htmlContent) {
      return NextResponse.json(
        {
          error: 'Resume not found',
          details: 'No tailored resume HTML stored for this job yet. Run "Tailor Resume" first.',
        },
        { status: 404 },
      );
    }

    const apiKey = process.env.PDFSHIFT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'PDF service not configured',
          details: 'PDFSHIFT_API_KEY is not set on the server.',
        },
        { status: 500 },
      );
    }

    const pdfRes = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        source: resume.htmlContent,
        format: 'A4',
        margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' },
        use_print: false,
      }),
    });

    if (!pdfRes.ok) {
      const err = await pdfRes.text();
      console.error('[tailor-resume:download] PDFShift error:', err);
      return NextResponse.json(
        { error: 'PDF generation failed', details: pdfRes.statusText },
        { status: 502 },
      );
    }

    const pdfBuffer = await pdfRes.arrayBuffer();
    const safeName = (resume.pdfFilename ?? `resume_${jobId}.pdf`).replace(/[^\w.\- ]/g, '_');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Content-Length': String(pdfBuffer.byteLength),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests. Please wait a few minutes and try again.' }, { status: 429 });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    console.error('[tailor-resume:download] error:', message);
    return NextResponse.json(
      { error: 'Failed to download resume', details: 'An unexpected error occurred while downloading your resume. Please try again.' },
      { status: 500 },
    );
  }
}
