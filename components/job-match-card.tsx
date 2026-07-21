"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRelativeTime, formatCurrency, truncate, safeExternalUrl } from "@/lib/utils";
import { ExternalLink, MapPin, Sparkles, Search, Loader2, Download } from "lucide-react";
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
  const matchClass = score >= 85 ? 'high' : score >= 75 ? 'med' : '';
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
      label="Tailoring your resume…"
      messages={[
        `Reading the job description for ${match.job.title}…`,
        "Identifying required skills and keywords…",
        "Matching your experience to the role…",
        "Crafting your professional summary…",
        "Optimising for ATS keywords…",
        "Generating your achievement bullets…",
        "Almost done — finalising your resume…",
      ]}
    />
    <WorkflowLoader
      show={researching}
      label="Researching company…"
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
    <div className="job-card">
      {/* Header */}
      <div className="job-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="job-title">{match.job.title}</h3>
          <p className="job-company">{match.job.companyName}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span className={`job-match ${matchClass}`}>{score}%</span>
          <button
            onClick={handleResearch}
            disabled={researching}
            className="btn btn-ghost btn-sm"
            style={researching ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            type="button"
          >
            {researching ? <Loader2 size={12} className="btn-spinner" /> : <Search size={12} />}
            {researching ? 'Researching…' : 'Research'}
          </button>
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--ink-3)', display: 'grid', placeItems: 'center' }}>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Meta — workType is suppressed when it duplicates the location string
          (e.g. location="Remote" + workType="Remote"). */}
      <div className="job-meta">
        {match.job.location && (
          <span><MapPin size={12} />{match.job.location}</span>
        )}
        {(match.job.salaryMin || match.job.salaryMax) && (
          <span>
            {match.job.salaryMin ? formatCurrency(match.job.salaryMin) : ''}
            {match.job.salaryMin && match.job.salaryMax ? ' – ' : ''}
            {match.job.salaryMax ? formatCurrency(match.job.salaryMax) : ''}
          </span>
        )}
        {match.job.workType &&
          match.job.workType.toLowerCase() !== (match.job.location ?? '').toLowerCase() && (
          <span>{match.job.workType}</span>
        )}
      </div>

      {/* Description */}
      {match.job.description && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '10px 0', lineHeight: 1.5 }}>
          {truncate(match.job.description, 130)}
        </p>
      )}

      {/* AI Reasoning */}
      {match.aiReasoning && (
        <div style={{
          background: 'color-mix(in oklab, var(--accent-d) 15%, transparent)',
          border: '1px dashed var(--line-2)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          marginBottom: 12,
          display: 'flex',
          gap: 8,
          fontSize: 12,
          color: 'var(--ink-2)',
        }}>
          <Sparkles size={13} color="var(--accent-d)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{match.aiReasoning}</span>
        </div>
      )}

      {/* Skill tags */}
      {(match.skillsMatched?.length ?? 0) > 0 && (
        <div className="job-tags" style={{ marginBottom: 0 }}>
          {match.skillsMatched!.map(skill => (
            <span
              key={skill}
              className="tag"
              style={{
                background: 'rgba(99, 102, 241, 0.18)',
                borderColor: 'rgba(129, 140, 248, 0.4)',
                borderStyle: 'solid',
                color: 'var(--primary-ink)',
                fontWeight: 500,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="job-cta" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          Matched {formatRelativeTime(match.createdAt)}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasResume ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-primary btn-sm"
              style={downloading ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
              type="button"
            >
              {downloading ? <Loader2 size={12} className="btn-spinner" /> : <Download size={12} />}
              {downloading ? 'Downloading…' : 'Download Resume'}
            </button>
          ) : (
            <button
              onClick={handleTailorResume}
              disabled={tailoring}
              className="btn btn-primary btn-sm"
              style={tailoring ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
              type="button"
            >
              {tailoring ? <Loader2 size={12} className="btn-spinner" /> : <Sparkles size={12} />}
              {tailoring ? 'Tailoring…' : 'Tailor Resume'}
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={applying || applied}
            className="btn btn-ghost btn-sm"
            style={applied ? { color: 'var(--accent-e, #16a34a)' } : applying ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            type="button"
          >
            {applying && <Loader2 size={12} className="btn-spinner" />}
            {applied ? '✓ Applied' : applying ? 'Saving…' : 'Apply'}
          </button>
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              View
            </a>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
