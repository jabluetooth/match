"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRelativeTime, formatCurrency, truncate, safeExternalUrl } from "@/lib/utils";
import { Check, Download, ExternalLink, Loader2, MapPin, Minus, Search, Sparkles } from "lucide-react";
import { FitScore } from "@/components/system/fit-score";
import { WorkflowLoader } from "@/components/workflow-loader";
import { toast } from "@/hooks/use-toast";

interface JobMatchCardProps {
  match: {
    id: number;
    userId: string;
    matchScore: number;
    aiReasoning?: string | null;
    skillsMatched?: string[];
    skillsMissing?: string[];
    createdAt: Date;
    hasResume?: boolean;
    job: {
      id: number;
      title: string;
      companyName: string;
      location: string | null;
      sourceUrl: string;
      description: string | null;
      salaryMin: number | null;
      salaryMax: number | null;
      workType: string | null;
    };
  };
}

export function JobMatchCard({ match }: JobMatchCardProps) {
  const router = useRouter();
  const [tailoring, setTailoring] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasResume, setHasResume] = useState(match.hasResume ?? false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [researching, setResearching] = useState(false);
  const score = Math.round(Number(match.matchScore));
  const sourceUrl = safeExternalUrl(match.job.sourceUrl);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/tailor/resume/${match.job.id}/download`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as { error?: string; details?: string }));
        const reason =
          err.error === 'Resume not found'
            ? 'Resume HTML not stored — please tailor the resume again to enable download.'
            : err.error === 'PDF service not configured'
              ? 'PDFShift API key missing on the server. Set PDFSHIFT_API_KEY in your env.'
              : err.error === 'PDF generation failed'
                ? `PDFShift couldn’t render this resume${err.details ? ` (${err.details})` : ''}. Try tailoring again.`
                : (err.details || err.error || 'Unexpected error.');
        toast.error('Download failed', reason, 8000);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${match.job.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(
        'Download failed',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setDownloading(false);
    }
  };

  const pollForResume = async () => {
    const maxAttempts = 100; // 100 × 3s = 5 min max
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const res = await fetch(`/api/tailor/resume/${match.job.id}/status`);
        const { ready, exists } = await res.json();
        if (ready) {
          setHasResume(true);
          setTailoring(false);
          return;
        }
        // Record exists but no HTML means n8n Insert node isn't storing html_content
        if (exists && i > 5) {
          setTailoring(false);
          toast.error(
            'Resume HTML missing',
            'Tailoring finished but no html_content was saved. Update the Insert Tailored Resume node in n8n, then tailor again.',
            8000,
          );
          return;
        }
      } catch { /* keep polling */ }
    }
    setTailoring(false);
    toast.error(
      'Tailoring timed out',
      'Check the n8n execution logs to see whether the workflow completed.',
      7000,
    );
  };

  const handleResearch = async () => {
    setResearching(true);
    try {
      const res = await fetch('/api/research/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: match.job.id }),
      });
      if (!res.ok) throw new Error('Failed');

      // The n8n workflow may not return `research_id` in its response payload
      // even when the save succeeds (depends on how the webhook is configured
      // — "respond immediately" vs "respond when workflow finishes"). The
      // research page handles "not yet ready" itself, so always navigate.
      router.push(`/research/${match.job.id}`);
    } catch {
      toast.error('Couldn’t start research', 'Please try again.');
      setResearching(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch('/api/track/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', job_id: match.job.id }),
      });
      if (res.status === 409) { setApplied(true); toast.info('Already applied', 'You have an existing application for this role.'); return; }
      if (!res.ok) throw new Error('Failed');
      setApplied(true);
      toast.success('Application started', `Tracking ${match.job.title} at ${match.job.companyName}.`);
    } catch {
      toast.error('Couldn’t create application', 'Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleTailorResume = async () => {
    setTailoring(true);

    // Start polling immediately so the trigger's response timing can't gate
    // the flow. n8n's webhook may respond after 30s if configured to wait for
    // the whole workflow; the DB row is what really matters.
    pollForResume();

    try {
      const res = await fetch('/api/tailor/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: match.job.id }),
      });

      // 4xx errors are authoritative — bail out. 5xx / timeout might just be
      // n8n taking longer than its sync window, so we let the poller continue.
      if (!res.ok && res.status >= 400 && res.status < 500) {
        const err = await res.json().catch(() => ({} as { error?: string; details?: string }));
        toast.error('Couldn’t tailor resume', err.error || err.details || 'Please try again.');
        setTailoring(false);
      }
    } catch {
      // Network error — keep polling; the workflow may already be running.
    }
  };

  return (
    <>
    <WorkflowLoader
      show={tailoring}
      messages={[
        `Reading the job description for ${match.job.title}…`,
        "Identifying required skills and keywords…",
        "Crafting your professional summary…",
        "Optimising for ATS keywords…",
        "Generating your achievement bullets…",
        "Almost done — finalising your resume…",
      ]}
    />
    <WorkflowLoader
      show={researching}
      messages={[
        `Visiting ${match.job.companyName}'s website…`,
        "Scraping company overview and mission…",
        "Fetching recent news and developments…",
        "Analysing the role and hiring context…",
        "Building your interview talking points…",
        "Identifying potential red flags…",
        "Finalising your research brief…",
      ]}
    />
    <article className="panel group flex h-full flex-col transition-colors hover:border-line-strong">
      <header className="flex gap-5 p-5">
        <FitScore score={score} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.45rem] leading-[1.1] text-ink">{match.job.title}</h3>
          <p className="mt-1 truncate text-sm text-ink-2">{match.job.companyName}</p>
          {/* workType is suppressed when it duplicates the location string
              (e.g. location="Remote" + workType="Remote"). */}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink-3">
            {match.job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} aria-hidden="true" />
                {match.job.location}
              </span>
            )}
            {(match.job.salaryMin || match.job.salaryMax) && (
              <span>
                {match.job.salaryMin ? formatCurrency(match.job.salaryMin) : ''}
                {match.job.salaryMin && match.job.salaryMax ? '–' : ''}
                {match.job.salaryMax ? formatCurrency(match.job.salaryMax) : ''}
              </span>
            )}
            {match.job.workType &&
              match.job.workType.toLowerCase() !== (match.job.location ?? '').toLowerCase() && (
              <span className="capitalize">{match.job.workType}</span>
            )}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-4 px-5 pb-5">
        {match.aiReasoning ? (
          <p className="border-l-2 border-accent/60 pl-3 text-[13px] leading-relaxed text-ink-2">
            <span className="sr-only">Why it matched: </span>
            {match.aiReasoning}
          </p>
        ) : match.job.description ? (
          <p className="text-[13px] leading-relaxed text-ink-3">{truncate(match.job.description, 160)}</p>
        ) : null}

        {((match.skillsMatched?.length ?? 0) > 0 || (match.skillsMissing?.length ?? 0) > 0) && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Skills">
            {match.skillsMatched?.map((skill) => (
              <li key={skill} className="inline-flex h-6 items-center gap-1 rounded border border-accent/25 bg-accent/10 px-2 font-mono text-[11px] text-accent-ink">
                <Check size={10} aria-label="you have" />
                {skill}
              </li>
            ))}
            {match.skillsMissing?.slice(0, 4).map((skill) => (
              <li key={skill} className="inline-flex h-6 items-center gap-1 rounded border border-dashed border-line-strong px-2 font-mono text-[11px] text-ink-3">
                <Minus size={10} aria-label="gap" />
                {skill}
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
        <span className="mr-auto font-mono text-[11px] text-ink-3">matched {formatRelativeTime(match.createdAt).toLowerCase()}</span>
        <button onClick={handleResearch} disabled={researching} className="btn btn-quiet btn-sm" type="button">
          {researching ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <Search size={12} aria-hidden="true" />}
          {researching ? 'Researching…' : 'Research'}
        </button>
        <button
          onClick={handleApply}
          disabled={applying || applied}
          className={applied ? 'btn btn-sm text-success disabled:opacity-100' : 'btn btn-ghost btn-sm'}
          type="button"
        >
          {applying && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
          {applied && <Check size={12} aria-hidden="true" />}
          {applied ? 'Applied' : applying ? 'Saving…' : 'Apply'}
        </button>
        {hasResume ? (
          <button onClick={handleDownload} disabled={downloading} className="btn btn-primary btn-sm" type="button">
            {downloading ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <Download size={12} aria-hidden="true" />}
            {downloading ? 'Downloading…' : 'Resume'}
          </button>
        ) : (
          <button onClick={handleTailorResume} disabled={tailoring} className="btn btn-primary btn-sm" type="button">
            {tailoring ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <Sparkles size={12} aria-hidden="true" />}
            {tailoring ? 'Tailoring…' : 'Tailor resume'}
          </button>
        )}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open the ${match.job.title} posting`}
            className="grid size-8 place-items-center rounded text-ink-3 hover:bg-raised hover:text-ink"
          >
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
      </footer>
    </article>
    </>
  );
}
