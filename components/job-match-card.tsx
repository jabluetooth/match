"use client";

import { useState } from "react";
import { formatRelativeTime, formatCurrency, truncate } from "@/lib/utils";
import { ExternalLink, MapPin, DollarSign, Sparkles, Search } from "lucide-react";
import { WorkflowLoader } from "@/components/workflow-loader";

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
  const [tailoring, setTailoring] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasResume, setHasResume] = useState(match.hasResume ?? false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [researching, setResearching] = useState(false);
  const score = Math.round(Number(match.matchScore));
  const matchClass = score >= 85 ? 'high' : score >= 75 ? 'med' : '';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/tailor/resume/${match.job.id}/download`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error === 'Resume not found'
          ? 'Resume HTML not stored — please tailor the resume again to enable download.'
          : 'Download failed. Please try again.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${match.job.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
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
          alert('Resume was tailored but the HTML content was not saved. Update the Insert Tailored Resume node in n8n to include html_content, then tailor again.');
          return;
        }
      } catch { /* keep polling */ }
    }
    setTailoring(false);
    alert('Tailoring timed out. Check n8n execution logs to see if the workflow completed.');
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
      const data = await res.json();
      const researchId = data?.result?.research_id;
      if (!researchId) {
        alert('Research completed but could not be saved. Check the n8n workflow logs for the "Save Research to DB1" node.');
        setResearching(false);
        return;
      }
      window.location.href = `/research/${match.job.id}`;
    } catch {
      alert('Failed to start company research. Please try again.');
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
      if (res.status === 409) { setApplied(true); return; }
      if (!res.ok) throw new Error('Failed');
      setApplied(true);
    } catch {
      alert('Failed to create application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleTailorResume = async () => {
    setTailoring(true);
    try {
      const res = await fetch('/api/tailor/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: match.job.id }),
      });
      if (!res.ok) throw new Error('Failed');
      pollForResume(); // fire and don't await — polling runs in background
    } catch {
      alert('Failed to tailor resume. Please try again.');
      setTailoring(false);
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
            <Search size={12} />
            {researching ? 'Researching…' : 'Research'}
          </button>
          <a href={match.job.sourceUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--ink-3)', display: 'grid', placeItems: 'center' }}>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Meta */}
      <div className="job-meta">
        {match.job.location && (
          <span><MapPin size={12} />{match.job.location}</span>
        )}
        {(match.job.salaryMin || match.job.salaryMax) && (
          <span>
            <DollarSign size={12} />
            {match.job.salaryMin ? formatCurrency(match.job.salaryMin) : ''}
            {match.job.salaryMin && match.job.salaryMax ? ' – ' : ''}
            {match.job.salaryMax ? formatCurrency(match.job.salaryMax) : ''}
          </span>
        )}
        {match.job.workType && <span>{match.job.workType}</span>}
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
            <span key={skill} className="tag" style={{ background: 'color-mix(in oklab, var(--accent-e) 30%, #fff)' }}>
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
              <Sparkles size={12} />
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
              <Sparkles size={12} />
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
            {applied ? '✓ Applied' : applying ? 'Saving…' : 'Apply'}
          </button>
          <a href={match.job.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            View
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
