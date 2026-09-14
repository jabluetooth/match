import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { PrepHtmlViewer } from '@/components/prep-html-viewer';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InterviewPrepViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireAuth();
  const { id: idParam } = await params;
  const id = parseInt(idParam);

  if (isNaN(id)) notFound();

  const prep = await prisma.interviewPrep.findUnique({
    where: { id },
    select: {
      userId: true,
      htmlContent: true,
      pdfGenerated: true,
      applicationId: true,
    },
  });

  if (!prep || prep.userId !== userId) notFound();
  if (!prep.htmlContent) redirect('/interviews');

  return (
    <div className="shell">
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/interviews"
            style={{ color: 'var(--ink-3)', display: 'grid', placeItems: 'center' }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1>Interview <em>Prep</em></h1>
            <p>Your personalised preparation guide</p>
          </div>
        </div>
        {prep.pdfGenerated && (
          <a
            href={`/api/interview-prep/${id}/download`}
            className="btn btn-primary btn-sm"
            download
          >
            <Download size={14} />
            Download PDF
          </a>
        )}
      </div>

      <div className="card" style={{ padding: 'var(--pad)' }}>
        <PrepHtmlViewer html={prep.htmlContent} />
      </div>
    </div>
  );
}
