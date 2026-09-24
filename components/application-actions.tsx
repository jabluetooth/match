"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarPlus, Loader2, X } from 'lucide-react';
import { statusMeta } from '@/lib/status';
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
      aria-label="Change status"
      aria-busy={loading}
      className="field h-8 w-full pl-2.5 text-xs disabled:cursor-wait disabled:opacity-60 md:w-[150px]"
    >
      {/* Keep a status the list doesn't offer (e.g. "submitted") selectable. */}
      {!(STATUSES as readonly string[]).includes(currentStatus) && (
        <option value={currentStatus}>{statusMeta(currentStatus).label}</option>
      )}
      {STATUSES.map(s => (
        <option key={s} value={s}>{statusMeta(s).label}</option>
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
        messages={[
          "Saving interview details…",
          "Updating your application status…",
          "Sending confirmation email…",
          "Almost done…",
        ]}
      />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="btn btn-primary" type="button">
            <CalendarPlus size={14} aria-hidden="true" />
            Schedule interview
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/80 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-48px)] w-[calc(100vw-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-line-strong bg-surface shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-interview-ink">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-interview" />
                    interview
                  </p>
                  <Dialog.Title className="mt-1 font-display text-2xl text-ink">Schedule an interview</Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs text-ink-3">
                    Saves the details, moves the application to Interview and emails you a confirmation.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="grid size-8 shrink-0 place-items-center rounded text-ink-3 hover:bg-raised hover:text-ink" aria-label="Close">
                  <X size={16} aria-hidden="true" />
                </Dialog.Close>
              </div>

              <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="field-label">Application</span>
                  <select className="field" value={form.application_id} onChange={e => field('application_id', e.target.value)}>
                    {applications.map(a => (
                      <option key={a.id} value={a.id}>{a.jobTitle} · {a.companyName}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-label">Date and time</span>
                  <input className="field" type="datetime-local" required value={form.interview_date} onChange={e => field('interview_date', e.target.value)} />
                </label>
                <label>
                  <span className="field-label">Format</span>
                  <select className="field" value={form.interview_type} onChange={e => field('interview_type', e.target.value)}>
                    <option value="video">Video call</option>
                    <option value="phone">Phone</option>
                    <option value="onsite">On-site</option>
                  </select>
                </label>
                <label className="sm:col-span-2">
                  <span className="field-label">Location or meeting link</span>
                  <input className="field" type="text" value={form.interview_location} onChange={e => field('interview_location', e.target.value)} placeholder="https://zoom.us/j/…" />
                </label>
                <label>
                  <span className="field-label">Interviewer</span>
                  <input className="field" type="text" value={form.interviewer_name} onChange={e => field('interviewer_name', e.target.value)} placeholder="Jane Doe" />
                </label>
                <label>
                  <span className="field-label">Their role</span>
                  <input className="field" type="text" value={form.interviewer_role} onChange={e => field('interviewer_role', e.target.value)} placeholder="Hiring manager" />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
                <Dialog.Close className="btn btn-ghost" type="button">Cancel</Dialog.Close>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <CalendarPlus size={14} aria-hidden="true" />}
                  {loading ? 'Scheduling…' : 'Schedule'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
