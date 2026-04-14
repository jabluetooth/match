"use client";

import Link from "next/link";
import { formatRelativeTime, getMatchScoreLabel } from "@/lib/utils";
import { ExternalLink, MapPin, Building2 } from "lucide-react";

interface Match {
  id: number;
  matchScore: number;
  job: {
    id: number;
    title: string;
    companyName: string;
    location: string | null;
    sourceUrl: string;
  };
  createdAt: Date;
}

interface RecentMatchesProps {
  matches: Match[];
}

export function RecentMatches({ matches }: RecentMatchesProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Matches</h2>
        <p className="text-sm text-gray-600">Your latest high-scoring opportunities</p>
      </div>

      <div className="divide-y divide-gray-200">
        {matches.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No matches yet. Check back soon!</p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">
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

                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(match.createdAt)}
                  </p>
                </div>

                <div className="ml-4">
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(Number(match.matchScore))}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {getMatchScoreLabel(Number(match.matchScore))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/jobs/${match.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {matches.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Link
            href="/jobs"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all matches →
          </Link>
        </div>
      )}
    </div>
  );
}
