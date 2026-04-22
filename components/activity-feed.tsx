"use client";

import { formatRelativeTime } from "@/lib/utils";
import {
  CheckCircle2,
  Calendar,
  FileText,
  Target,
  XCircle,
  Gift,
} from "lucide-react";

interface Activity {
  id: number;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  createdAt: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ACTIVITY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  job_matched: {
    icon: Target,
    color: '#1877f2',
    bg: '#1877f220',
    label: 'New job match',
  },
  application_submitted: {
    icon: FileText,
    color: '#7c3aed',
    bg: '#7c3aed20',
    label: 'Application submitted',
  },
  interview_scheduled: {
    icon: Calendar,
    color: '#22c55e',
    bg: '#22c55e20',
    label: 'Interview scheduled',
  },
  application_rejected: {
    icon: XCircle,
    color: '#ef4444',
    bg: '#ef444420',
    label: 'Application rejected',
  },
  offer_received: {
    icon: Gift,
    color: '#fdc901',
    bg: '#fdc90120',
    label: 'Offer received',
  },
  resume_tailored: {
    icon: CheckCircle2,
    color: '#06b6d4',
    bg: '#06b6d420',
    label: 'Resume tailored',
  },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div
      className="rounded-2xl bg-white border shadow-sm overflow-hidden"
      style={{ borderColor: '#e2e3e4' }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: '#e2e3e4' }}>
        <h2 className="text-sm font-bold" style={{ color: '#080101' }}>
          Recent Activity
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#473e3b' }}>
          Your latest job search actions
        </p>
      </div>

      <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: '#e2e3e4' }}>
        {activities.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={{ color: '#473e3b' }}>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.action] ?? {
              icon: CheckCircle2,
              color: '#9ca3af',
              bg: '#9ca3af20',
              label: activity.action,
            };
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="px-5 py-3 flex items-start gap-3 hover:bg-[#fcfcff] transition-colors"
              >
                <div
                  className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: config.bg }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: '#080101' }}>
                    {config.label}
                  </p>
                  {activity.metadata?.companyName && (
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: '#473e3b' }}>
                      {activity.metadata.companyName}
                      {activity.metadata.jobTitle ? ` · ${activity.metadata.jobTitle}` : ''}
                    </p>
                  )}
                  <p className="text-[10px] mt-0.5" style={{ color: '#e2e3e4' }}>
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
