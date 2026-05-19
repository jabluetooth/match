export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { requireUserWithSync } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Calendar, AlertTriangle, Sparkles } from 'lucide-react';

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
      <div className="shell">
        <div style={{ maxWidth: 720, marginInline: 'auto' }}>
          <Link
            href="/jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--ink-3)',
              fontSize: 13,
              textDecoration: 'none',
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={14} /> Back to Jobs
          </Link>

          <div className="card" style={{ textAlign: 'center', padding: '48px var(--pad)' }}>
            <span
              aria-hidden
              style={{
                width: 48,
                height: 48,
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 18px',
                borderRadius: 14,
                background: 'var(--primary-soft)',
                color: 'var(--accent-strong)',
                border: '1px solid color-mix(in oklab, var(--accent-c) 30%, transparent)',
              }}
            >
              <Sparkles size={20} />
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
              }}
            >
              Researching {job.companyName}
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              The agent is reading {job.companyName}&apos;s website, recent news, and the role
              context. This usually takes a minute or two.
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--ink-3)' }}>
              You&apos;ll also get the brief by email when it&apos;s ready.
            </p>
            <Link
              href={`/research/${jobIdNum}`}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 18, textDecoration: 'none' }}
            >
              Check again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const talkingPoints = (research.talkingPoints as TalkingPoint[] | null) ?? [];
  const questionsToAsk = (research.questionsToAsk as string[] | null) ?? [];
  const redFlags = (research.redFlags as string[] | null) ?? [];
  const recentDevelopments = (research.recentDevelopments as string[] | null) ?? [];

  return (
    <div className="shell">
      <div style={{ maxWidth: 920, marginInline: 'auto' }}>
        <Link
          href="/jobs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--ink-3)',
            fontSize: 13,
            textDecoration: 'none',
            marginBottom: 18,
          }}
        >
          <ArrowLeft size={14} /> Back to Jobs
        </Link>

        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 18,
            marginBottom: 28,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 56,
              height: 56,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 14,
              background: 'var(--primary-soft)',
              border: '1px solid color-mix(in oklab, var(--accent-c) 30%, transparent)',
              color: 'var(--accent-strong)',
              flexShrink: 0,
            }}
          >
            <Building2 size={26} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.4vw, 38px)',
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
              }}
            >
              {research.companyName}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-2)' }}>{job.title}</p>
            {research.companyUrl && (
              <a
                href={research.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  color: 'var(--primary-ink)',
                  fontSize: 12.5,
                }}
              >
                {research.companyUrl}
              </a>
            )}
          </div>
          {research.confidenceScore != null && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32,
                  color: 'var(--accent-c)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {research.confidenceScore}%
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 10.5,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink-3)',
                }}
              >
                Confidence
              </div>
            </div>
          )}
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {research.companyOverview && (
            <ResearchSection title="Company Overview" body={research.companyOverview} />
          )}

          {research.missionAndValues && (
            <ResearchSection title="Mission & Values" body={research.missionAndValues} />
          )}

          {recentDevelopments.length > 0 && (
            <ResearchListSection
              title="Recent Developments"
              icon={<Calendar size={15} />}
              items={recentDevelopments}
            />
          )}

          {research.whyTheyAreHiring && (
            <ResearchSection title="Why They’re Hiring" body={research.whyTheyAreHiring} />
          )}

          {talkingPoints.length > 0 && (
            <section className="card">
              <p className="card-title" style={{ marginBottom: 14 }}>
                Talking points for the interview
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {talkingPoints.map((point, idx) => (
                  <div
                    key={idx}
                    style={{
                      paddingLeft: 14,
                      borderLeft: '3px solid var(--accent-strong)',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--ink)',
                      }}
                    >
                      {point.topic || `Point ${idx + 1}`}
                    </h3>
                    {point.point && (
                      <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                        {point.point}
                      </p>
                    )}
                    {point.source && (
                      <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--ink-3)' }}>
                        Source: {point.source}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {questionsToAsk.length > 0 && (
            <section className="card">
              <p className="card-title" style={{ marginBottom: 12 }}>
                Questions to ask
              </p>
              <ol style={{ margin: 0, padding: '0 0 0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {questionsToAsk.map((question, idx) => (
                  <li key={idx} style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.55 }}>
                    {question}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {redFlags.length > 0 && (
            <section
              className="card"
              style={{
                background: 'var(--danger-soft)',
                borderColor: 'color-mix(in oklab, var(--danger) 30%, transparent)',
              }}
            >
              <p
                className="card-title"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--danger-ink)',
                  marginBottom: 10,
                }}
              >
                <AlertTriangle size={14} /> Red flags
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {redFlags.map((flag, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: 8,
                      fontSize: 13.5,
                      color: 'var(--danger-ink)',
                      lineHeight: 1.5,
                    }}
                  >
                    <span aria-hidden style={{ flexShrink: 0 }}>⚠</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {research.researchNotes && (
            <ResearchSection title="Additional notes" body={research.researchNotes} />
          )}

          <section style={{ fontSize: 11.5, color: 'var(--ink-3)', padding: '8px 4px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              <span>
                <strong style={{ color: 'var(--ink-2)' }}>Created:</strong>{' '}
                {new Date(research.createdAt).toLocaleString()}
              </span>
              <span>
                <strong style={{ color: 'var(--ink-2)' }}>Updated:</strong>{' '}
                {new Date(research.updatedAt).toLocaleString()}
              </span>
              {research.websiteScraped && <span>Website scraped</span>}
              {research.newsCount > 0 && <span>{research.newsCount} news article{research.newsCount === 1 ? '' : 's'}</span>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ResearchSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="card">
      <p className="card-title" style={{ marginBottom: 10 }}>
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: 'var(--ink)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}
      >
        {body}
      </p>
    </section>
  );
}

function ResearchListSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon?: React.ReactNode;
  items: string[];
}) {
  return (
    <section className="card">
      <p className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        {icon} {title}
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, idx) => (
          <li
            key={idx}
            style={{
              display: 'flex',
              gap: 10,
              fontSize: 13.5,
              color: 'var(--ink)',
              lineHeight: 1.55,
            }}
          >
            <span aria-hidden style={{ color: 'var(--accent-c)', flexShrink: 0 }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
