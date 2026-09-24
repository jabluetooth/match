import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { PrepHtmlViewer } from '@/components/prep-html-viewer';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Interview prep' };

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
    <div className="mx-auto max-w-[960px]">
      <Link href="/interviews" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-3 hover:text-ink">
        <ArrowLeft size={13} aria-hidden="true" />
        interviews
      </Link>

      <header className="mb-6 mt-6 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-interview-ink">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-interview" />
            prep guide
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,3.6vw,2.75rem)] leading-[1.02] tracking-[-0.015em] text-ink">
            Interview <em className="text-accent-ink">prep</em>
          </h1>
          <p className="mt-1 text-sm text-ink-2">Role analysis, likely questions and answer scaffolds, written for this interview.</p>
        </div>
        {prep.pdfGenerated && (
          <a href={`/api/interview-prep/${id}/download`} className="btn btn-primary" download>
            <Download size={14} aria-hidden="true" />
            Download PDF
          </a>
        )}
      </header>

      <PrepHtmlViewer html={prep.htmlContent} />
    </div>
  );
}
