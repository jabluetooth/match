"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationCard } from './application-card';
import { X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Application {
  id: number;
  userId: string;
  status: string;
  appliedAt: Date | null;
  notes: string | null;
  interviewDate: Date | null;
  job: {
    id: number;
    title: string;
    companyName: string;
    location: string | null;
    sourceUrl: string;
    description: string | null;
  };
}

interface ApplicationBoardProps {
  applications: {
    draft:     Application[];
    submitted: Application[];
    screening: Application[];
    interview: Application[];
    offer:     Application[];
    rejected:  Application[];
  };
}

// CSS class names match the prototype exactly
const COLUMNS: { id: keyof ApplicationBoardProps['applications']; label: string; cssClass: string }[] = [
  { id: 'draft',     label: 'Draft',       cssClass: 'draft' },
  { id: 'submitted', label: 'Submitted',   cssClass: 'submitted' },
  { id: 'screening', label: 'Screening',   cssClass: 'screening' },
  { id: 'interview', label: 'Interview',   cssClass: 'interview' },
  { id: 'offer',     label: 'Offer',       cssClass: 'offer' },
  { id: 'rejected',  label: 'Rejected',    cssClass: 'rejected' },
];

// Map DB status → CSS class used in the prototype
function statusCssClass(status: string): string {
  if (status === 'applied')      return 'submitted';
  if (status === 'phone_screen') return 'screening';
  return status;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft', applied: 'Submitted', submitted: 'Submitted',
    phone_screen: 'Screening', screening: 'Screening',
    interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
  };
  return map[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

// Build a simple activity timeline from known data
function buildTimeline(app: Application) {
  const events: { title: string; time: string }[] = [];
  if (app.appliedAt) {
    events.push({ title: 'Application submitted', time: new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) });
  }
  if (app.interviewDate) {
    events.push({ title: 'Interview scheduled', time: new Date(app.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) });
  }
  if (app.status === 'offer') {
    events.push({ title: 'Offer received', time: '—' });
  }
  if (app.status === 'rejected') {
    events.push({ title: 'Application closed', time: '—' });
  }
  return events;
}

export function ApplicationBoard({ applications }: ApplicationBoardProps) {
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [researching, setResearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const closePanel = () => setSelectedApp(null);

  const handleApply = async () => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/track/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          user_id: selectedApp.userId,
          application_id: selectedApp.id,
          status: 'applied',
          notes: 'Applied via dashboard',
          trigger_n8n: true,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Marked as applied', `${selectedApp.job.title} at ${selectedApp.job.companyName}.`);
      setSelectedApp(null);
      router.refresh();
    } catch {
      toast.error('Couldn’t update', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResearch = async () => {
    if (!selectedApp) return;
    setResearching(true);
    try {
      const res = await fetch('/api/research/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedApp.userId,
          application_id: selectedApp.id,
          job_id: selectedApp.job.id,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Research started', 'It will appear here when ready.');
    } catch {
      toast.error('Couldn’t start research', 'Please try again.');
    } finally {
      setResearching(false);
    }
  };

  const timeline = selectedApp ? buildTimeline(selectedApp) : [];
  const css = selectedApp ? statusCssClass(selectedApp.status) : '';
  const lbl = selectedApp ? statusLabel(selectedApp.status) : '';

  return (
    <>
      {/* Kanban grid */}
      <div className="kanban">
        {COLUMNS.map((col) => {
          const apps = applications[col.id];
          return (
            <div key={col.id} className={`column ${col.cssClass}`}>
              <div className="column-head">
                <div className="column-title">
                  <span>{col.label}</span>
                  <div className="column-badge">{apps.length}</div>
                </div>
              </div>
              <div className="column-divider" />
              <div className="cards">
                {apps.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">→</div>
                    <div className="empty-state-text">No applications yet</div>
                  </div>
                ) : (
                  apps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      statusCss={statusCssClass(app.status)}
                      statusLabel={statusLabel(app.status)}
                      onClick={() => setSelectedApp(app)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlay */}
      <div className={`panel-overlay ${selectedApp ? 'open' : ''}`} onClick={closePanel} />

      {/* Side panel */}
      <div className={`panel ${selectedApp ? 'open' : ''}`}>
        {selectedApp && (
          <>
            <div className="panel-head">
              <div>
                <h2 className="panel-title">{selectedApp.job.title}</h2>
                <div className="panel-company">{selectedApp.job.companyName}</div>
              </div>
              <button className="panel-close" onClick={closePanel} type="button" aria-label="Close">
                <X size={15} />
              </button>
            </div>

            <div className="panel-body">
              {/* Status */}
              <div className="panel-section">
                <label className="panel-section-label">Status</label>
                <div className={`app-card-status ${css}`}>
                  <span className="dot" />
                  {lbl}
                </div>
              </div>

              {/* Applied date */}
              <div className="panel-section">
                <label className="panel-section-label">Applied date</label>
                <div className="panel-section-content">
                  {selectedApp.appliedAt
                    ? formatRelativeTime(selectedApp.appliedAt)
                    : '—'}
                </div>
              </div>

              {/* Job description */}
              {selectedApp.job.description && (
                <div className="panel-section">
                  <label className="panel-section-label">Job description</label>
                  <div className="panel-section-content" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {selectedApp.job.description}
                  </div>
                </div>
              )}

              <div className="divider" />

              {/* Timeline */}
              <div className="panel-section">
                <label className="panel-section-label">Timeline</label>
                {timeline.length === 0 ? (
                  <p className="panel-section-content" style={{ color: 'var(--ink-3)' }}>No activity yet</p>
                ) : (
                  <div className="timeline">
                    {timeline.map((t, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-content-title">{t.title}</div>
                          <div className="timeline-content-time">{t.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="divider" />

              {/* Notes */}
              <div className="panel-section">
                <label className="panel-section-label">Notes</label>
                <div className="panel-section-content" style={{ color: selectedApp.notes ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {selectedApp.notes ?? 'No notes added yet.'}
                </div>
              </div>
            </div>

            <div className="panel-footer">
              <div className="panel-actions">
                {selectedApp.status === 'draft' ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleApply}
                    disabled={submitting}
                    type="button"
                  >
                    {submitting ? 'Applying…' : 'Mark as Applied →'}
                  </button>
                ) : (
                  <a
                    href={selectedApp.job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    View posting →
                  </a>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleResearch}
                  disabled={researching}
                  type="button"
                >
                  {researching ? 'Starting…' : 'Research Company'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
