"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { WorkflowLoader } from '@/components/workflow-loader';
import { toast } from '@/hooks/use-toast';

interface FollowUpCardProps {
  followUp: {
    id: number;
    applicationId: number;
    userId: string;
    followupType: string;
    followupNumber: number;
    draftSubject: string | null;
    draftBody: string | null;
    tone: string;
    sentAt: Date | null;
    responseStatus: string;
    application: {
      userId: string;
      job: {
        title: string;
        companyName: string;
      };
    };
  };
  onResponse?: () => void;
}

export function FollowUpCard({ followUp, onResponse }: FollowUpCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResponse = async (responseStatus: 'replied' | 'no_response' | 'bounced') => {
    setLoading(true);
    try {
      const res = await fetch('/api/followup/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followup_id: followUp.id,
          application_id: followUp.applicationId,
          user_id: followUp.application.userId,
          response_status: responseStatus,
          trigger_n8n: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.details || 'Failed to update follow-up');
      }
      const result = await res.json();
      const titles = { replied: 'Marked as replied', no_response: 'Marked as no response', bounced: 'Marked as bounced' };
      toast.success(titles[responseStatus], `Response rate: ${result.response_rate_pct}%`);
      onResponse?.();
      router.refresh();
    } catch (error: unknown) {
      toast.error('Couldn’t update follow-up', (error as Error).message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const daysSinceSent = followUp.sentAt
    ? Math.floor((Date.now() - new Date(followUp.sentAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
    <WorkflowLoader
      show={loading}
      messages={[
        "Updating your follow-up status…",
        "Recalculating your response rate…",
        "Advancing application stage…",
      ]}
    />
    <article className="panel overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight text-ink">{followUp.application.job.companyName}</h3>
          <p className="mt-0.5 truncate text-[13px] text-ink-2">{followUp.application.job.title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-ink-3">
          <span className="inline-flex h-6 items-center gap-1.5 rounded border border-line px-2">
            <Mail size={11} aria-hidden="true" />
            #{followUp.followupNumber}
          </span>
          {daysSinceSent !== null && (
            <span className="inline-flex h-6 items-center gap-1.5 rounded border border-warning/25 bg-warning/10 px-2 text-warning">
              <Clock size={11} aria-hidden="true" />
              {daysSinceSent}d waiting
            </span>
          )}
        </div>
      </header>

      {followUp.draftSubject && (
        <div className="mx-5 mt-4 overflow-hidden rounded border border-line bg-raised">
          <p className="flex gap-3 border-b border-line px-3 py-2 text-[13px]">
            <span className="w-14 shrink-0 font-mono text-[11px] leading-5 text-ink-3">subject</span>
            <span className="min-w-0 text-ink">{followUp.draftSubject}</span>
          </p>
          {followUp.draftBody && (
            <details className="group px-3 py-2">
              <summary className="flex cursor-pointer list-none gap-3 text-[13px] [&::-webkit-details-marker]:hidden">
                <span className="w-14 shrink-0 font-mono text-[11px] leading-5 text-ink-3">body</span>
                <span className="min-w-0 flex-1 text-ink-2">
                  <span className="line-clamp-2 group-open:line-clamp-none group-open:whitespace-pre-line">{followUp.draftBody}</span>
                  <span className="mt-1 inline-block font-mono text-[11px] text-accent-ink group-open:hidden">show full draft</span>
                </span>
              </summary>
            </details>
          )}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
        <span className="mr-auto text-xs text-ink-3">Did they write back?</span>
        <button onClick={() => handleResponse('replied')} disabled={loading} className="btn btn-primary btn-sm" type="button">
          {loading ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={12} aria-hidden="true" />}
          They replied
        </button>
        <button onClick={() => handleResponse('no_response')} disabled={loading} className="btn btn-ghost btn-sm" type="button">
          <XCircle size={12} aria-hidden="true" />
          No response
        </button>
        <button onClick={() => handleResponse('bounced')} disabled={loading} className="btn btn-danger btn-sm" type="button">
          <AlertCircle size={12} aria-hidden="true" />
          Bounced
        </button>
      </footer>
    </article>
    </>
  );
}
