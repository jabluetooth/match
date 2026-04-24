import { formatRelativeTime } from "@/lib/utils";
import {
  CheckCircle2,
  Calendar,
  FileText,
  Target,
  XCircle,
  Gift,
  Inbox,
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

const ACTIVITY_CONFIG: Record<string, {
  icon: React.ElementType;
  bg: string;
  color: string;
  label: string;
}> = {
  job_matched:           { icon: Target,       bg: 'rgba(168,197,255,.25)', color: 'var(--accent-c)', label: 'New job match' },
  application_submitted: { icon: FileText,     bg: 'rgba(255,179,154,.25)', color: 'var(--accent-a)', label: 'Application submitted' },
  interview_scheduled:   { icon: Calendar,     bg: 'rgba(159,230,201,.25)', color: 'var(--accent-e)', label: 'Interview scheduled' },
  application_rejected:  { icon: XCircle,      bg: 'rgba(252,165,165,.2)',  color: '#ef4444',         label: 'Application rejected' },
  offer_received:        { icon: Gift,         bg: 'rgba(159,230,201,.3)',  color: '#4FC8A3',         label: 'Offer received' },
  resume_tailored:       { icon: CheckCircle2, bg: 'rgba(184,166,255,.25)', color: 'var(--accent-d)', label: 'Résumé tailored' },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="card g-activity" style={{ padding: 0 }}>
      <div className="card-head" style={{ padding: 'var(--pad)', paddingBottom: 0, marginBottom: 0 }}>
        <div>
          <p className="card-title">Timeline</p>
          <p className="card-lead">Activity</p>
        </div>
        <div className="tile-ico" style={{ background: 'var(--bg-2)', backdropFilter: 'none', border: '1px solid var(--line)' }}>
          <Inbox size={15} color="var(--ink-3)" />
        </div>
      </div>

      <div style={{ marginTop: 16, maxHeight: 340, overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <div style={{ padding: '24px var(--pad)', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
            No recent activity
          </div>
        ) : (
          activities.map((activity) => {
            const cfg = ACTIVITY_CONFIG[activity.action] ?? {
              icon: CheckCircle2,
              bg: 'rgba(156,163,175,.2)',
              color: '#9ca3af',
              label: activity.action,
            };
            const Icon = cfg.icon;

            return (
              <div key={activity.id} className="activity-row">
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: cfg.bg,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={14} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                    {cfg.label}
                  </p>
                  {activity.metadata?.companyName && (
                    <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activity.metadata.companyName}
                      {activity.metadata.jobTitle ? ` · ${activity.metadata.jobTitle}` : ''}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '2px 0 0', opacity: 0.7 }}>
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
