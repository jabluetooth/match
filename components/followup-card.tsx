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
      label="Logging response…"
      messages={[
        "Updating your follow-up status…",
        "Recalculating your response rate…",
        "Advancing application stage…",
      ]}
    />
    <div className="followup-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h3 className="followup-title">{followUp.application.job.companyName} · {followUp.application.job.title}</h3>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 999,
          background: 'color-mix(in oklab, var(--accent-c) 20%, transparent)',
          color: 'oklch(0.28 0.05 260)',
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
        }}>
          <Mail size={11} />
          Follow-up #{followUp.followupNumber}
        </span>
      </div>

      {followUp.draftSubject && (
        <div style={{
          background: 'var(--bg-2)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          marginBottom: 10,
          fontSize: 12.5,
        }}>
          <p style={{ fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>Subject:</p>
          <p style={{ color: 'var(--ink-2)', margin: 0 }}>{followUp.draftSubject}</p>
          {followUp.draftBody && (
            <>
              <p style={{ fontWeight: 600, color: 'var(--ink)', margin: '8px 0 4px' }}>Body:</p>
              <p style={{ color: 'var(--ink-2)', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {followUp.draftBody}
              </p>
            </>
          )}
        </div>
      )}

      <div className="followup-meta">
        {daysSinceSent !== null && (
          <span><Clock size={12} /> Sent {daysSinceSent} {daysSinceSent === 1 ? 'day' : 'days'} ago</span>
        )}
      </div>

      <p className="followup-next">Follow-up pending</p>

      <div className="followup-actions">
        <button
          onClick={() => handleResponse('replied')}
          disabled={loading}
          className="btn btn-primary btn-sm"
          type="button"
          style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
        >
          {loading ? <Loader2 size={12} className="btn-spinner" /> : <CheckCircle2 size={12} />}
          They Replied
        </button>
        <button
          onClick={() => handleResponse('no_response')}
          disabled={loading}
          className="btn btn-ghost btn-sm"
          type="button"
          style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
        >
          {loading ? <Loader2 size={12} className="btn-spinner" /> : <XCircle size={12} />}
          No Response
        </button>
        <button
          onClick={() => handleResponse('bounced')}
          disabled={loading}
          className="btn btn-ghost btn-sm"
          type="button"
          style={{ color: 'var(--destructive, #ef4444)', ...(loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
        >
          {loading ? <Loader2 size={12} className="btn-spinner" /> : <AlertCircle size={12} />}
          Bounced
        </button>
      </div>
    </div>
    </>
  );
}
