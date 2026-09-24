export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { BrandLoader } from '@/components/ui/brand-loader';
import { safeExternalUrl } from '@/lib/utils';

export const metadata = { title: 'Company research' };

interface PageProps {
  params: Promise<{ jobId: string }>;
}

interface TalkingPoint {
  topic?: string;
  point?: string;
  source?: string;
}

export default async function CompanyResearchPage({ params }: PageProps) {
  const { jobId } = await params;
  const user = await requireUserWithSync();

  const userId = user.id;
  const jobIdNum = parseInt(jobId, 10);
  if (Number.isNaN(jobIdNum)) notFound();

  const [research, job] = await Promise.all([
    prisma.companyResearch.findUnique({
      where: { jobId_userId: { jobId: jobIdNum, userId } },
    }),
    prisma.job.findUnique({ where: { id: jobIdNum } }),
  ]);

  if (!job) notFound();

  // Research is generated asynchronously by the n8n workflow. If we got here
  // before the row landed, show a "preparing" state instead of a hard 404 so
  // the user can come back in a moment.
  if (!research) {
    return (
      <div className="mx-auto max-w-[720px]">
        <BackLink />
        <div className="panel mt-6 overflow-hidden">
          <BrandLoader fullScreen={false} hideTitle label={`Researching ${job.companyName}`} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[52ch] text-[13px] leading-relaxed text-ink-2">
            The agent is reading {job.companyName}&apos;s website, recent news and the role. This usually takes a
            minute or two, and the brief is emailed to you too.
          </p>
          <Link href={`/research/${jobIdNum}`} className="btn btn-ghost btn-sm">
            <RefreshCw size={12} aria-hidden="true" />
            Check again
          </Link>
        </div>
      </div>
    );
  }

  const talkingPoints = (research.talkingPoints as TalkingPoint[] | null) ?? [];
  const questionsToAsk = (research.questionsToAsk as string[] | null) ?? [];
  const redFlags = (research.redFlags as string[] | null) ?? [];
  const recentDevelopments = (research.recentDevelopments as string[] | null) ?? [];
  const companyUrl = safeExternalUrl(research.companyUrl);

  // Only sections with content get a number, so the index never skips.
  const sections: { title: string; node: ReactNode; danger?: boolean }[] = [];
  if (research.companyOverview) sections.push({ title: 'Overview', node: <Prose text={research.companyOverview} /> });
  if (research.missionAndValues) sections.push({ title: 'Mission & values', node: <Prose text={research.missionAndValues} /> });
  if (recentDevelopments.length > 0) sections.push({ title: 'Recent developments', node: <Bullets items={recentDevelopments} /> });
  if (research.whyTheyAreHiring) sections.push({ title: 'Why they’re hiring', node: <Prose text={research.whyTheyAreHiring} /> });
  if (talkingPoints.length > 0)
    sections.push({
      title: 'Talking points',
      node: (
        <ol className="space-y-5">
          {talkingPoints.map((point, idx) => (
            <li key={idx} className="border-l-2 border-accent/60 pl-4">
              <h3 className="text-[15px] font-medium text-ink">{point.topic || `Point ${idx + 1}`}</h3>
              {point.point && <p className="mt-1 text-sm leading-relaxed text-ink-2">{point.point}</p>}
              {point.source && <p className="mt-1.5 font-mono text-[11px] text-ink-3">source: {point.source}</p>}
            </li>
          ))}
        </ol>
      ),
    });
  if (questionsToAsk.length > 0)
    sections.push({
      title: 'Questions to ask',
      node: (
        <ol className="space-y-3">
          {questionsToAsk.map((question, idx) => (
            <li key={idx} className="flex gap-4 text-sm leading-relaxed text-ink">
              <span className="w-5 shrink-0 font-mono text-xs leading-6 text-accent">{String(idx + 1).padStart(2, '0')}</span>
              <span>{question}</span>
            </li>
          ))}
        </ol>
      ),
    });
  if (redFlags.length > 0)
    sections.push({
      title: 'Red flags',
      danger: true,
      node: (
        <ul className="space-y-2.5">
          {redFlags.map((flag, idx) => (
            <li key={idx} className="flex gap-3 text-sm leading-relaxed text-ink">
              <AlertTriangle size={14} className="mt-1 shrink-0 text-danger" aria-hidden="true" />
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      ),
    });
  if (research.researchNotes) sections.push({ title: 'Notes', node: <Prose text={research.researchNotes} /> });

  return (
    <div className="mx-auto max-w-[960px]">
      <BackLink />

      <header className="mt-6 flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">research brief</p>
          <h1 className="mt-2 font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1] tracking-[-0.015em] text-ink">
            {research.companyName}
          </h1>
          <p className="mt-2 text-sm text-ink-2">For the {job.title} role</p>
          {companyUrl && (
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-accent-ink underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
            >
              {research.companyUrl}
              <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          )}
        </div>
        {research.confidenceScore != null && (
          <div className="shrink-0 sm:text-right">
            <p className="font-mono text-5xl font-medium leading-none tracking-[-0.04em] text-ink">
              {research.confidenceScore}
              <span className="ml-0.5 align-top text-xl text-accent">%</span>
            </p>
            <p className="eyebrow mt-2">agent confidence</p>
          </div>
        )}
      </header>

      <div className="divide-y divide-line">
        {sections.map((section, i) => (
          <section key={section.title} className="grid gap-4 py-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
            <h2 className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.12em] md:sticky md:top-[calc(var(--topbar-h)+24px)] md:self-start">
              <span className={section.danger ? 'text-danger' : 'text-accent'}>{String(i + 1).padStart(2, '0')}</span>
              <span className={section.danger ? 'text-danger' : 'text-ink-2'}>{section.title}</span>
            </h2>
            <div className="max-w-[68ch]">{section.node}</div>
          </section>
        ))}
      </div>

      <footer className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-5 font-mono text-[11px] text-ink-3">
        <span>created {new Date(research.createdAt).toLocaleString()}</span>
        <span>updated {new Date(research.updatedAt).toLocaleString()}</span>
        {research.websiteScraped && <span>website scraped</span>}
        {research.newsCount > 0 && <span>{research.newsCount} news article{research.newsCount === 1 ? '' : 's'}</span>}
      </footer>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/jobs" className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-3 hover:text-ink">
      <ArrowLeft size={13} aria-hidden="true" />
      job matches
    </Link>
  );
}

function Prose({ text }: { text: string }) {
  return <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-ink">{text}</p>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-3 text-sm leading-relaxed text-ink">
          <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
