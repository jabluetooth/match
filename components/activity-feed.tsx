"use client";

import { formatRelativeTime } from "@/lib/utils";
import { 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Target,
  XCircle,
  Gift
} from "lucide-react";

interface Activity {
  id: number;
  activityType: string;
  entityType: string | null;
  entityId: number | null;
  metadata: any;
  createdAt: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ACTIVITY_CONFIG = {
  job_matched: { 
    icon: Target, 
    color: 'text-blue-600 bg-blue-100',
    label: 'New job match'
  },
  application_submitted: { 
    icon: FileText, 
    color: 'text-purple-600 bg-purple-100',
    label: 'Application submitted'
  },
  interview_scheduled: { 
    icon: Calendar, 
    color: 'text-green-600 bg-green-100',
    label: 'Interview scheduled'
  },
  application_rejected: { 
    icon: XCircle, 
    color: 'text-red-600 bg-red-100',
    label: 'Application rejected'
  },
  offer_received: { 
    icon: Gift, 
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Offer received'
  },
  resume_tailored: { 
    icon: CheckCircle2, 
    color: 'text-indigo-600 bg-indigo-100',
    label: 'Resume tailored'
  },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <p className="text-sm text-gray-600">Your latest job search actions</p>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.activityType as keyof typeof ACTIVITY_CONFIG] || {
              icon: CheckCircle2,
              color: 'text-gray-600 bg-gray-100',
              label: activity.activityType,
            };

            const Icon = config.icon;

            return (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {config.label}
                    </p>
                    {activity.metadata?.companyName && (
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.metadata.companyName}
                        {activity.metadata.jobTitle && ` - ${activity.metadata.jobTitle}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
