"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Loader2, X } from 'lucide-react';
import { WorkflowLoader } from '@/components/workflow-loader';
import { toast } from '@/hooks/use-toast';

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
      toast.success('Status updated', `Now: ${newStatus.replace(/_/g, ' ')}`);
      router.refresh();
    } catch {
      toast.error('Couldn’t update status', 'Please try again.');
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
    if (!form.interview_date) { toast.error('Date required', 'Please choose an interview date and time.'); return; }
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
      toast.success('Interview scheduled', new Date(form.interview_date).toLocaleString());
      router.refresh();
    } catch (err: any) {
      toast.error('Couldn’t schedule interview', err.message || 'Please try again.');
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
                {loading ? <><Loader2 size={14} className="btn-spinner" /> Scheduling…</> : <><Calendar size={14} /> Schedule</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

