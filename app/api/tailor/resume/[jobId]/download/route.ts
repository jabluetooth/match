import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const userId = await requireAuth();
  const { jobId: jobIdStr } = await params;
  const jobId = parseInt(jobIdStr);

  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
  }

  const resume = await prisma.tailoredResume.findFirst({
    where: { userId, jobId },
    orderBy: { version: 'desc' },
    select: { htmlContent: true, pdfFilename: true },
  });

  if (!resume?.htmlContent) {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }

  const apiKey = process.env.PDFSHIFT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'PDF service not configured' }, { status: 500 });
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
    console.error('[PDFShift] error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 502 });
  }

  const pdfBuffer = await pdfRes.arrayBuffer();
  const filename = resume.pdfFilename ?? `resume_${jobId}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
