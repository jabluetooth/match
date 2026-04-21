"use client";

import { useState } from "react";
import { formatRelativeTime, formatCurrency, truncate } from "@/lib/utils";
import { ExternalLink, MapPin, Building2, DollarSign, Sparkles } from "lucide-react";

interface JobMatchCardProps {
  match: {
    id: number;
    userId: number;
    matchScore: number;
    aiReasoning?: string | null;
    skillsMatched?: string[];
    skillsMissing?: string[];
    createdAt: Date;
    job: {
      id: number;
      title: string;
      companyName: string;
      location: string | null;
      sourceUrl: string;
      description: string | null;
      salaryMin: number | null;
      salaryMax: number | null;
      workType: string | null;
    };
  };
}

export function JobMatchCard({ match }: JobMatchCardProps) {
  const [tailoring, setTailoring] = useState(false);
  const score = Math.round(Number(match.matchScore));

  const handleTailorResume = async () => {
    setTailoring(true);
    try {
      const response = await fetch('/api/tailor/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: match.userId,
          job_id: match.job.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start resume tailoring');
      }

      alert('Resume tailoring started! You will receive an email when ready.');
    } catch (error) {
      console.error('Failed to tailor resume:', error);
      alert('Failed to start resume tailoring. Please try again.');
    } finally {
      setTailoring(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {match.job.title}
              </h3>
              <a
                href={match.job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {match.job.companyName}
              </span>
              {match.job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {match.job.location}
                </span>
              )}
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="ml-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg px-4 py-2 text-center">
              <div className="text-2xl font-bold">{score}%</div>
              <div className="text-xs opacity-90">Match</div>
            </div>
          </div>
        </div>

        {/* Salary & Work Type */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          {(match.job.salaryMin || match.job.salaryMax) && (
            <span className="flex items-center gap-1 text-gray-700">
              <DollarSign className="h-4 w-4" />
              {match.job.salaryMin && formatCurrency(match.job.salaryMin)}
              {match.job.salaryMin && match.job.salaryMax && ' - '}
              {match.job.salaryMax && formatCurrency(match.job.salaryMax)}
            </span>
          )}
          {match.job.workType && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
              {match.job.workType}
            </span>
          )}
        </div>

        {/* Description */}
        {match.job.description && (
          <p className="text-sm text-gray-600 mb-4">
            {truncate(match.job.description, 150)}
          </p>
        )}

        {/* AI Reasoning */}
        {match.aiReasoning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">{match.aiReasoning}</p>
            </div>
          </div>
        )}

        {/* Skills */}
        {(match.skillsMatched?.length || match.skillsMissing?.length) ? (
          <div className="mb-4">
            {match.skillsMatched && match.skillsMatched.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Matching Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {match.skillsMatched.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {match.skillsMissing && match.skillsMissing.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Skills to Learn:</p>
                <div className="flex flex-wrap gap-1">
                  {match.skillsMissing.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Matched {formatRelativeTime(match.createdAt)}
          </p>
          
          <button
            onClick={handleTailorResume}
            disabled={tailoring}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {tailoring ? 'Tailoring...' : 'Tailor Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}
