import { FileText, Phone, Calendar, Gift, XCircle, Pencil, CheckCircle2 } from "lucide-react";

interface ApplicationFunnelProps {
  data: Array<{ status: string; _count: number }>;
}

const STAGE_CONFIG: Record<string, {
  label: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
}> = {
  draft:        { label: 'Draft',        sub: 'Not submitted yet',       icon: Pencil,      iconColor: '#9ca3af' },
  applied:      { label: 'Applied',      sub: 'Submitted applications',  icon: FileText,    iconColor: 'var(--accent-c)' },
  phone_screen: { label: 'Phone Screen', sub: 'Initial screening calls', icon: Phone,       iconColor: 'var(--accent-a)' },
  interview:    { label: 'Interview',    sub: 'Active interview rounds',  icon: Calendar,    iconColor: 'var(--accent-b)' },
  offer:        { label: 'Offer',        sub: 'Received an offer',        icon: Gift,        iconColor: '#9FE6C9' },
  accepted:     { label: 'Accepted',     sub: 'Offer accepted',           icon: CheckCircle2,iconColor: '#6DCBAE' },
  rejected:     { label: 'Rejected',     sub: 'No longer active',         icon: XCircle,     iconColor: '#fca5a5' },
};

export function ApplicationFunnel({ data }: ApplicationFunnelProps) {
  const total = data.reduce((s, i) => s + i._count, 0);
  const max = Math.max(...data.map(d => d._count), 1);

  return (
    <div className="card g-funnel">
      <div className="card-head">
        <div>
          <p className="card-title">Pipeline</p>
          <p className="card-lead">Application funnel</p>
        </div>
        {total > 0 && (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            letterSpacing: '-0.02em',
            color: 'var(--ink-2)',
            lineHeight: 1,
          }}>
            {total}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          No applications yet
        </div>
      ) : (
        <div className="funnel">
          {data.map((item) => {
            const cfg = STAGE_CONFIG[item.status] ?? {
              label: item.status,
              sub: '',
              icon: FileText,
              iconColor: '#9ca3af',
            };
            const Icon = cfg.icon;
            const pct = Math.round((item._count / total) * 100);
            const barWidth = Math.round((item._count / max) * 100);

            return (
              <div key={item.status} className="stage">
                <div className="stage-ico" style={{ color: cfg.iconColor }}>
                  <Icon size={14} />
                </div>
                <div>
                  <p className="stage-name">{cfg.label}</p>
                  <p className="stage-sub">{cfg.sub}</p>
                </div>
                <div className="stage-count">
                  {item._count}
                  {pct > 0 && <span className="stage-pct">{pct}%</span>}
                </div>
                <div className="stage-bar">
                  <span style={{ width: `${barWidth}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
