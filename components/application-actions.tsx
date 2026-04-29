"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Send, Calendar, Loader2, X } from 'lucide-react';
import { WorkflowLoader } from '@/components/workflow-loader';

const STATUSES = [
  'interested', 'applied', 'phone_screen', 'interview',
  'final_round', 'offer', 'rejected', 'withdrawn', 'accepted',
] as const;

// ─── Compact row status selector (used in /applications) ────────────────────

interface ApplicationRowActionsProps {
  applicationId: number;
  currentStatus: string;
}

export function ApplicationRowActions({ applicationId, currentStatus }: ApplicationRowActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/track/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', application_id: applicationId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      router.refresh();
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={loading}
      style={{
        fontSize: 12,
        padding: '3px 6px',
        borderRadius: 6,
        border: '1px solid var(--line-2)',
        background: 'var(--bg)',
        color: 'var(--ink)',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {STATUSES.map(s => (
        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
      ))}
    </select>
  );
}

// ─── Schedule interview modal (used in /interviews) ──────────────────────────

interface ScheduleInterviewModalProps {
  applications: { id: number; jobTitle: string; companyName: string }[];
}

export function ScheduleInterviewModal({ applications }: ScheduleInterviewModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    application_id: applications[0]?.id ?? '',
    interview_date: '',
    interview_type: 'video',
    interview_location: '',
    interviewer_name: '',
    interviewer_role: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.interview_date) { alert('Interview date is required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/track/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_interview',
          application_id: Number(form.application_id),
          interview_date: new Date(form.interview_date).toISOString(),
          interview_type: form.interview_type,
          interview_location: form.interview_location || undefined,
          interviewer_name: form.interviewer_name || undefined,
          interviewer_role: form.interviewer_role || undefined,
          trigger_n8n: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to schedule interview');
      }
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (applications.length === 0) return null;

  return (
    <>
      <WorkflowLoader
        show={loading}
        label="Scheduling interview…"
        messages={[
          "Saving interview details…",
          "Updating your application status…",
          "Sending confirmation email…",
          "Almost done…",
        ]}
      />
      <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
        <Calendar size={14} />
        Schedule new
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingBottom: 80,
        }}>
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius)',
              padding: 28,
              width: '100%',
              maxWidth: 440,
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 20 }}>Schedule interview</h2>
              <button type="button" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>
                <X size={18} />
              </button>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
              Application
              <select value={form.application_id} onChange={e => field('application_id', e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line-2)', fontSize: 13 }}>
                {applications.map(a => (
                  <option key={a.id} value={a.id}>{a.jobTitle} — {a.companyName}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
              Date &amp; time *
              <input type="datetime-local" required value={form.interview_date} onChange={e => field('interview_date', e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line-2)', fontSize: 13 }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
              Format
              <select value={form.interview_type} onChange={e => field('interview_type', e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line-2)', fontSize: 13 }}>
                <option value="video">Video call</option>
                <option value="phone">Phone</option>
                <option value="onsite">On-site</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
              Location / meeting link
              <input type="text" value={form.interview_location} onChange={e => field('interview_location', e.target.value)}
                placeholder="https://zoom.us/j/…"
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line-2)', fontSize: 13 }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
              Interviewer name
              <input type="text" value={form.interviewer_name} onChange={e => field('interviewer_name', e.target.value)}
                placeholder="Jane Doe"
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line-2)', fontSize: 13 }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
              Interviewer role
              <input type="text" value={form.interviewer_role} onChange={e => field('interviewer_role', e.target.value)}
                placeholder="Hiring Manager"
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line-2)', fontSize: 13 }} />
            </label>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Scheduling…</> : <><Calendar size={14} /> Schedule</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

interface ApplicationActionsProps {
  userId: string;
  jobId?: number;
  applicationId?: number;
  onSuccess?: () => void;
}

/**
 * Example component showing how to trigger n8n Application Tracker workflow from frontend
 *
 * Usage:
 * <ApplicationActions userId={1} jobId={6} />
 */
export function ApplicationActions({ userId, jobId, applicationId, onSuccess }: ApplicationActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new application
   */
  const handleCreateApplication = async () => {
    if (!jobId) {
      setError('Job ID is required to create an application');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/track/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          user_id: userId,
          job_id: jobId,
          status: 'draft',
          notes: 'Application created from frontend',
          trigger_n8n: true, // Set to true to trigger n8n workflow for emails
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to create application');
      }

      const result = await response.json();
      console.log('Application created:', result);

      onSuccess?.();
      alert(`Application created successfully! ID: ${result.application_id}`);
    } catch (err: any) {
      console.error('Failed to create application:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update application status
   */
  const handleUpdateStatus = async (newStatus: string) => {
    if (!applicationId) {
      setError('Application ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/track/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          user_id: userId,
          application_id: applicationId,
          status: newStatus,
          notes: `Status updated to ${newStatus}`,
          trigger_n8n: true, // Trigger n8n for status update emails
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to update status');
      }

      const result = await response.json();
      console.log('Status updated:', result);

      onSuccess?.();
      alert(`Status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Schedule an interview
   */
  const handleScheduleInterview = async () => {
    if (!applicationId) {
      setError('Application ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Example: Schedule interview for next week
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(14, 0, 0, 0); // 2 PM

      const response = await fetch('/api/track/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'schedule_interview',
          user_id: userId,
          application_id: applicationId,
          interview_date: nextWeek.toISOString(),
          interview_type: 'video',
          interview_location: 'Zoom',
          interviewer_name: 'Jane Doe',
          interviewer_role: 'Hiring Manager',
          trigger_n8n: true, // Trigger n8n for interview confirmation emails
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to schedule interview');
      }

      const result = await response.json();
      console.log('Interview scheduled:', result);

      onSuccess?.();
      alert(`Interview scheduled for ${new Date(result.interview_date).toLocaleString()}`);
    } catch (err: any) {
      console.error('Failed to schedule interview:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Create Application Button */}
        {jobId && !applicationId && (
          <button
            onClick={handleCreateApplication}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Create Application
          </button>
        )}

        {/* Update Status Buttons */}
        {applicationId && (
          <>
            <button
              onClick={() => handleUpdateStatus('applied')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Mark as Applied
            </button>

            <button
              onClick={handleScheduleInterview}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Schedule Interview
            </button>
          </>
        )}
      </div>
    </div>
  );
}
