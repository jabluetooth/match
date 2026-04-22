"use client";

import { ApplicationCard } from './application-card';
import { getStatusColor } from '@/lib/utils';

interface Application {
  id: number;
  userId: string;
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
}

interface ApplicationBoardProps {
  applications: {
    draft: Application[];
    submitted: Application[];
    screening: Application[];
    interview: Application[];
    offer: Application[];
    rejected: Application[];
  };
}

const COLUMNS = [
  { id: 'draft', label: 'Draft', color: 'border-gray-300' },
  { id: 'submitted', label: 'Submitted', color: 'border-blue-300' },
  { id: 'screening', label: 'Screening', color: 'border-purple-300' },
  { id: 'interview', label: 'Interview', color: 'border-green-300' },
  { id: 'offer', label: 'Offer', color: 'border-yellow-300' },
  { id: 'rejected', label: 'Rejected', color: 'border-red-300' },
];

export function ApplicationBoard({ applications }: ApplicationBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {COLUMNS.map((column) => {
        const apps = applications[column.id as keyof typeof applications];
        
        return (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div className={`bg-white rounded-t-lg border-t-4 ${column.color} p-4 shadow`}>
              <h3 className="font-semibold text-gray-900">{column.label}</h3>
              <p className="text-sm text-gray-600">{apps.length} applications</p>
            </div>

            {/* Column Content */}
            <div className="bg-gray-50 rounded-b-lg p-2 space-y-2 min-h-[300px] flex-1">
              {apps.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">No applications</p>
                </div>
              ) : (
                apps.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
