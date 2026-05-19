import { FileText, Phone, Calendar, Gift, XCircle, Pencil, CheckCircle2 } from "lucide-react";

interface ApplicationFunnelProps {
  data: Array<{ status: string; _count: number }>;
}

interface StageStyle {
  label: string;
  sub: string;
  icon: React.ElementType;
  /** Icon foreground color. */
  iconColor: string;
  /** Soft background for the icon tile. */
  iconBg: string;
}

const STAGE_CONFIG: Record<string, StageStyle> = {
  draft:        { label: 'Draft',        sub: 'Not submitted yet',      icon: Pencil,       iconColor: 'var(--ink-2)',     iconBg: 'var(--bg-2)' },
  applied:      { label: 'Applied',      sub: 'Submitted applications', icon: FileText,     iconColor: 'var(--info)',      iconBg: 'var(--info-soft)' },
  phone_screen: { label: 'Phone Screen', sub: 'Initial screening',      icon: Phone,        iconColor: 'var(--accent-strong)', iconBg: 'var(--primary-soft)' },
  interview:    { label: 'Interview',    sub: 'Active rounds',          icon: Calendar,     iconColor: '#6d28d9',          iconBg: '#ede9fe' },
  offer:        { label: 'Offer',        sub: 'Received an offer',      icon: Gift,         iconColor: 'var(--success)',   iconBg: 'var(--success-soft)' },
  accepted:     { label: 'Accepted',     sub: 'Offer accepted',         icon: CheckCircle2, iconColor: 'var(--success)',   iconBg: 'var(--success-soft)' },
  rejected:     { label: 'Rejected',     sub: 'No longer active',       icon: XCircle,      iconColor: 'var(--danger)',    iconBg: 'var(--danger-soft)' },
};

const FALLBACK: StageStyle = {
  label: '',
  sub: '',
  icon: FileText,
  iconColor: 'var(--ink-2)',
  iconBg: 'var(--bg-2)',
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
        <div
          style={{
            padding: '28px 0 4px',
            textAlign: 'center',
            color: 'var(--ink-3)',
            fontSize: 13,
          }}
        >
          <p style={{ margin: 0 }}>No applications yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.8 }}>
            Roles you apply to will appear here.
          </p>
        </div>
      ) : (
        <ol
          style={{
            listStyle: 'none',
            margin: '14px 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {data.map((item) => {
            const cfg = { ...FALLBACK, ...STAGE_CONFIG[item.status], label: STAGE_CONFIG[item.status]?.label || item.status };
            const Icon = cfg.icon;
            const pct = total > 0 ? Math.round((item._count / total) * 100) : 0;
            const barWidth = Math.round((item._count / max) * 100);
            const isEmpty = item._count === 0;

            return (
              <li
                key={item.status}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr auto',
                  alignItems: 'center',
                  rowGap: 10,
                  columnGap: 14,
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                  opacity: isEmpty ? 0.55 : 1,
                  transition: 'opacity .15s ease',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background: cfg.iconBg,
                    color: cfg.iconColor,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>
                    {cfg.label}
                  </p>
                  {!isEmpty && cfg.sub && (
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.3 }}>
                      {cfg.sub}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    fontFamily: 'var(--font-display)',
                    fontSize: 26,
                    letterSpacing: '-0.02em',
                    color: isEmpty ? 'var(--ink-3)' : 'var(--ink)',
                    lineHeight: 1,
                  }}
                >
                  {item._count}
                  {pct > 0 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--ink-3)',
                        background: 'var(--bg-2)',
                        padding: '2px 7px',
                        borderRadius: 999,
                        letterSpacing: 0,
                      }}
                    >
                      {pct}%
                    </span>
                  )}
                </div>

                <div
                  style={{
                    gridColumn: '1 / -1',
                    height: 4,
                    borderRadius: 999,
                    background: 'var(--line)',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      height: '100%',
                      width: `${barWidth}%`,
                      background: isEmpty
                        ? 'var(--line-2)'
                        : 'linear-gradient(90deg, var(--accent-c), var(--accent-strong))',
                      borderRadius: 'inherit',
                      transition: 'width .6s ease',
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
