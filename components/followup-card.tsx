"use client";

import { useState } from 'react';
import { Mail, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
  const [responseRate, setResponseRate] = useState<number | null>(null);

  const handleResponse = async (responseStatus: 'replied' | 'no_response' | 'bounced') => {
    setLoading(true);

    try {
      const response = await fetch('/api/followup/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followup_id: followUp.id,
          application_id: followUp.applicationId,
          user_id: followUp.application.userId,
          response_status: responseStatus,
          trigger_n8n: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errorMessage || 'Failed to update follow-up');
      }

      const result = await response.json();
      console.log('[Follow-up] Response recorded:', result);

      setResponseRate(result.response_rate_pct);

      const statusMessages = {
        replied: 'Great! Application status updated to Phone Screen.',
        no_response: 'Follow-up marked as no response.',
        bounced: 'Email marked as bounced.',
      };

      alert(`${statusMessages[responseStatus]} Response rate: ${result.response_rate_pct}%`);

      // Call parent callback to refresh list
      onResponse?.();
    } catch (error: any) {
      console.error('Failed to update follow-up:', error);
      alert(error.message || 'Failed to update follow-up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const daysSinceSent = followUp.sentAt
    ? Math.floor((Date.now() - new Date(followUp.sentAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {followUp.application.job.title}
          </h3>
          <p className="text-sm text-gray-600">{followUp.application.job.companyName}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
          <Mail className="h-3 w-3" />
          Follow-up #{followUp.followupNumber} ({followUp.followupType})
        </div>
      </div>

      {/* Email Draft Preview */}
      {followUp.draftSubject && (
        <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
          <p className="font-semibold text-gray-800 mb-1">Subject:</p>
          <p className="text-gray-700 mb-2">{followUp.draftSubject}</p>
          {followUp.draftBody && (
            <>
              <p className="font-semibold text-gray-800 mb-1">Body:</p>
              <p className="text-gray-700 line-clamp-3">{followUp.draftBody}</p>
            </>
          )}
        </div>
      )}

      {/* Days Since Sent */}
      {daysSinceSent !== null && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Clock className="h-4 w-4" />
          <span>Sent {daysSinceSent} {daysSinceSent === 1 ? 'day' : 'days'} ago</span>
        </div>
      )}

      {/* Response Rate Display */}
      {responseRate !== null && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm font-semibold text-green-800">
            Your response rate: {responseRate}%
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleResponse('replied')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCircle2 className="h-4 w-4" />
          They Replied
        </button>

        <button
          onClick={() => handleResponse('no_response')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <XCircle className="h-4 w-4" />
          No Response
        </button>

        <button
          onClick={() => handleResponse('bounced')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <AlertCircle className="h-4 w-4" />
          Email Bounced
        </button>
      </div>

      {loading && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Processing...
        </div>
      )}
    </div>
  );
}
