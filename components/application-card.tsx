"use client";

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import { Building2, Calendar, FileText, ExternalLink, Search, CheckCircle } from 'lucide-react';

interface CompanyResearch {
  id: number;
  companyName: string;
  companyOverview: string | null;
  missionAndValues: string | null;
  recentDevelopments: any;
  whyTheyAreHiring: string | null;
  talkingPoints: any;
  questionsToAsk: any;
  redFlags: any;
  researchNotes: string | null;
  createdAt: Date;
}

interface ApplicationCardProps {
  application: {
    id: number;
    userId: number;
    status: string;
    appliedDate: Date | null;
    tailoredResumeUrl: string | null;
    coverLetterUrl: string | null;
    notes: string | null;
    jobMatch: {
      job: {
        id: number;
        title: string;
        companyName: string;
        location: string | null;
        sourceUrl: string;
      };
    };
    interviews: Array<{
      id: number;
      scheduledDate: Date | null;
      interviewType: string | null;
    }>;
  };
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const [researching, setResearching] = useState(false);
  const [companyResearch, setCompanyResearch] = useState<CompanyResearch | null>(null);
  const [showResearch, setShowResearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nextInterview = application.interviews[0];

  const fetchCompanyResearch = async () => {
    try {
      const response = await fetch(
        `/api/research/company/${application.jobMatch.job.id}?user_id=${application.userId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`[Research] Loaded for Job ID ${application.jobMatch.job.id}:`, data.companyName);
        setCompanyResearch(data);
      } else {
        console.log(`[Research] Not found for Job ID ${application.jobMatch.job.id}`);
      }
    } catch (error) {
      console.error('Failed to fetch company research:', error);
    }
  };

  // Fetch existing company research on mount
  useEffect(() => {
    fetchCompanyResearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.jobMatch.job.id, application.userId]);

  const handleResearchCompany = async () => {
    setResearching(true);
    try {
      const response = await fetch('/api/research/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: application.userId,
          application_id: application.id,
          job_id: application.jobMatch.job.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to start company research');
      }

      // Wait a bit and refresh the research data
      setTimeout(() => {
        fetchCompanyResearch();
      }, 2000);

      alert('Company research started! Refreshing data...');
    } catch (error: any) {
      console.error('Failed to research company:', error);
      alert(error.message || 'Failed to start company research. Please try again.');
    } finally {
      setResearching(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/track/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          user_id: application.userId,
          application_id: application.id,
          status: 'applied',
          notes: 'Application applied via dashboard',
          trigger_n8n: true, // ← This triggers the n8n webhook!
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to apply to job');
      }

      const result = await response.json();
      console.log('[Application] Applied:', result);

      alert(`Application applied! ${result.email_sent ? 'Confirmation email sent.' : ''}`);

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to apply to job:', error);
      alert(error.message || 'Failed to apply to job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
      {/* Job Title */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {application.jobMatch.job.title}
        </h4>
        <a
          href={application.jobMatch.job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 ml-1"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Company */}
      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
        <Building2 className="h-3 w-3" />
        <span className="truncate">{application.jobMatch.job.companyName}</span>
      </div>

      {/* Applied Date */}
      {application.appliedDate && (
        <div className="text-xs text-gray-500 mb-2">
          Applied {formatRelativeTime(application.appliedDate)}
        </div>
      )}

      {/* Next Interview */}
      {nextInterview && nextInterview.scheduledDate && (
        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded px-2 py-1 mb-2">
          <Calendar className="h-3 w-3" />
          <span>
            {nextInterview.interviewType || 'Interview'} -{' '}
            {new Date(nextInterview.scheduledDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Documents */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
        {application.tailoredResumeUrl && (
          <a
            href={application.tailoredResumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <FileText className="h-3 w-3" />
            Resume
          </a>
        )}
        {application.coverLetterUrl && (
          <a
            href={application.coverLetterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <FileText className="h-3 w-3" />
            Cover Letter
          </a>
        )}
      </div>

      {/* Apply Button (only show if status is draft) */}
      {application.status === 'draft' && (
        <button
          onClick={handleSubmitApplication}
          disabled={submitting}
          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Applying...' : 'Mark as Applied'}
        </button>
      )}

      {/* Research Company Section */}
      <div className="mt-2 space-y-2">
        {companyResearch ? (
          <>
            <button
              onClick={() => setShowResearch(!showResearch)}
              className="w-full px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              {showResearch ? 'Hide Research' : 'View Research'}
            </button>

            {showResearch && (
              <div className="text-xs bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
                {companyResearch.companyOverview && (
                  <div>
                    <p className="font-semibold text-gray-700">Overview:</p>
                    <p className="text-gray-600 line-clamp-3">{companyResearch.companyOverview}</p>
                  </div>
                )}
                {companyResearch.missionAndValues && (
                  <div>
                    <p className="font-semibold text-gray-700">Mission & Values:</p>
                    <p className="text-gray-600 line-clamp-2">{companyResearch.missionAndValues}</p>
                  </div>
                )}
                {companyResearch.whyTheyAreHiring && (
                  <div>
                    <p className="font-semibold text-gray-700">Why They're Hiring:</p>
                    <p className="text-gray-600 line-clamp-2">{companyResearch.whyTheyAreHiring}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <a
                    href={`/research/${application.jobMatch.job.id}?user_id=${application.userId}`}
                    className="flex-1 text-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    View Full Report
                  </a>
                  <button
                    onClick={handleResearchCompany}
                    disabled={researching}
                    className="text-purple-600 hover:text-purple-700 font-medium px-2"
                  >
                    {researching ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={handleResearchCompany}
            disabled={researching}
            className="w-full px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
          >
            <Search className="h-3 w-3" />
            {researching ? 'Researching...' : 'Research Company'}
          </button>
        )}
      </div>

      {/* Notes Preview */}
      {application.notes && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {application.notes}
        </p>
      )}
    </div>
  );
}
