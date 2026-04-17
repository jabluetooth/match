"use client";

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import { Building2, Calendar, FileText, ExternalLink, Search } from 'lucide-react';

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
  const nextInterview = application.interviews[0];

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

      alert('Company research started! Check back soon for insights.');
    } catch (error: any) {
      console.error('Failed to research company:', error);
      alert(error.message || 'Failed to start company research. Please try again.');
    } finally {
      setResearching(false);
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

      {/* Research Company Button */}
      <button
        onClick={handleResearchCompany}
        disabled={researching}
        className="w-full mt-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
      >
        <Search className="h-3 w-3" />
        {researching ? 'Researching...' : 'Research Company'}
      </button>

      {/* Notes Preview */}
      {application.notes && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {application.notes}
        </p>
      )}
    </div>
  );
}
