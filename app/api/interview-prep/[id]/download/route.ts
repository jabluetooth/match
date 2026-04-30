import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid prep ID' }, { status: 400 });
    }

    const prep = await prisma.interviewPrep.findUnique({
      where: { id },
      select: { userId: true, pdfBinary: true, pdfGenerated: true },
    });

    if (!prep || prep.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!prep.pdfGenerated || !prep.pdfBinary) {
      return NextResponse.json({ error: 'PDF not yet generated' }, { status: 404 });
    }

    return new NextResponse(prep.pdfBinary, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="interview-prep.pdf"',
        'Content-Length': prep.pdfBinary.length.toString(),
      },
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to download PDF' }, { status: 500 });
  }
}
