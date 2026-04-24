"use client";

import { useState } from "react";
import { formatRelativeTime, formatCurrency, truncate } from "@/lib/utils";
import { ExternalLink, MapPin, DollarSign, Sparkles } from "lucide-react";

interface JobMatchCardProps {
  match: {
    id: number;
    userId: string;
    matchScore: number;
    aiReasoning?: string | null;
    skillsMatched?: string[];
    skillsMissing?: string[];
    createdAt: Date;
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
  const score = Math.round(Number(match.matchScore));
  const matchClass = score >= 85 ? 'high' : score >= 75 ? 'med' : '';

  const handleTailorResume = async () => {
    setTailoring(true);
    try {
      const res = await fetch('/api/tailor/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: match.userId, job_id: match.job.id }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('Resume tailoring started! You will receive an email when ready.');
    } catch {
      alert('Failed to start resume tailoring. Please try again.');
    } finally {
      setTailoring(false);
    }
  };

  return (
    <div className="job-card">
      {/* Header */}
      <div className="job-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="job-title">{match.job.title}</h3>
          <p className="job-company">{match.job.companyName}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span className={`job-match ${matchClass}`}>{score}%</span>
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
          <a href={match.job.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            View
          </a>
        </div>
      </div>
    </div>
  );
}
