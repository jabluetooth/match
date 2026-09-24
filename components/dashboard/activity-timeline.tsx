import { statusMeta, TONE_CLASS, type StatusTone } from "@/lib/status";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Activity {
  id: number;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  createdAt: Date;
  application: { job: { title: string; companyName: string } } | null;
}

// The workflow writes three actions (see Match.json): created,
// status_change and interview_scheduled. The rest are kept for older rows.
function describe(a: Activity): { label: string; tone: StatusTone } {
  switch (a.action) {
    case "created":
      return { label: "Application created", tone: "neutral" };
    case "interview_scheduled":
      return { label: "Interview scheduled", tone: "interview" };
    case "status_change": {
      if (!a.toStatus) return { label: "Status changed", tone: "neutral" };
      const to = statusMeta(a.toStatus);
      const from = a.fromStatus ? statusMeta(a.fromStatus).label : null;
      return { label: from ? `${from} → ${to.label}` : `Moved to ${to.label}`, tone: to.tone };
    }
    case "job_matched":
      return { label: "New job match", tone: "accent" };
    case "application_submitted":
      return { label: "Application submitted", tone: "accent" };
    case "application_rejected":
      return { label: "Application rejected", tone: "danger" };
    case "offer_received":
      return { label: "Offer received", tone: "success" };
    case "resume_tailored":
      return { label: "Resume tailored", tone: "accent" };
    default:
      return { label: a.action.replace(/_/g, " "), tone: "neutral" };
  }
}

/** A vertical ledger of what changed, newest first. */
export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <section className="panel" aria-labelledby="activity-title">
      <h2 id="activity-title" className="eyebrow px-5 pb-3 pt-5">Activity</h2>
      {activities.length === 0 ? (
        <p className="border-t border-line px-5 py-8 text-sm text-ink-3">No activity yet.</p>
      ) : (
        <ol className="relative max-h-[360px] overflow-y-auto border-t border-line px-5 py-4">
          <span aria-hidden="true" className="absolute bottom-4 left-[23px] top-4 w-px bg-line" />
          {activities.map((a) => {
            const { label, tone } = describe(a);
            return (
              <li key={a.id} className="relative flex gap-4 py-2">
                <span aria-hidden="true" className={cn("relative mt-1.5 size-[7px] shrink-0 rounded-full ring-4 ring-surface", TONE_CLASS[tone].dot)} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink">{label}</p>
                  <p className="truncate text-xs text-ink-3">
                    {a.application ? `${a.application.job.companyName} · ${a.application.job.title}` : null}
                  </p>
                </div>
                <time className="shrink-0 pt-0.5 font-mono text-[11px] text-ink-3" dateTime={new Date(a.createdAt).toISOString()}>
                  {formatRelativeTime(a.createdAt).toLowerCase()}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
