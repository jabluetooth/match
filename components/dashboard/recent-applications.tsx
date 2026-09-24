import Link from "next/link";
import { ArrowUpRight, Briefcase } from "lucide-react";
import { StatusPill } from "@/components/system/status-pill";
import { StageTicks } from "@/components/system/stage-rail";
import { statusMeta } from "@/lib/status";
import { formatRelativeTime } from "@/lib/utils";

interface RecentApplication {
  id: number;
  status: string;
  updatedAt: Date;
  job: { title: string; companyName: string };
}

/** The last few applications you touched, with how far each one got. */
export function RecentApplications({ items }: { items: RecentApplication[] }) {
  return (
    <section className="panel" aria-labelledby="recent-title">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 id="recent-title" className="eyebrow">Recent applications</h2>
        <Link href="/applications" className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-3 hover:text-accent-ink">
          all <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center gap-3 border-t border-line px-5 py-8 text-sm text-ink-3">
          <Briefcase size={16} aria-hidden="true" />
          Nothing yet. Apply from a job match and it lands here.
        </div>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {items.map((app) => {
            const meta = statusMeta(app.status);
            return (
              <li key={app.id} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{app.job.title}</p>
                  <p className="truncate text-xs text-ink-3">
                    {app.job.companyName} · {formatRelativeTime(app.updatedAt).toLowerCase()}
                  </p>
                </div>
                <StageTicks reached={meta.stage} closed={meta.closed} className="hidden sm:inline-flex" />
                <StatusPill status={app.status} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
