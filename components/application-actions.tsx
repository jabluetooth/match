"use client";

import { useState } from 'react';
import { FileText, Send, Calendar, Loader2 } from 'lucide-react';

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
