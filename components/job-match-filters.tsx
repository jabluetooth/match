"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface JobMatchFiltersProps {
  userId: string;
}

export function JobMatchFilters({ userId }: JobMatchFiltersProps) {
  const [matching, setMatching] = useState(false);

  const handleFindMatches = async () => {
    setMatching(true);
    try {
      const response = await fetch('/api/match/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger job matching');
      }

      alert('Job matching started! New matches will appear shortly.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to trigger job matching:', error);
      alert('Failed to start job matching. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs by title or company..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Locations</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </select>

        <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Sort by Match</option>
          <option value="score">Highest Match</option>
          <option value="date">Most Recent</option>
        </select>

        <button
          onClick={handleFindMatches}
          disabled={matching}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium transition-colors whitespace-nowrap"
        >
          <Sparkles className="h-4 w-4" />
          {matching ? 'Finding...' : 'Find New Matches'}
        </button>
      </div>
    </div>
  );
}
