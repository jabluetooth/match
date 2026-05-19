import { FileText, Phone, Calendar, Gift, ArrowRight, type LucideIcon } from "lucide-react";

interface PipelineStage {
  key: string;
  label: string;
  /** Cumulative count: applications that reached this stage or later. */
  count: number;
  icon: LucideIcon;
}

interface ApplicationsPipelineProps {
  stages: PipelineStage[];
  total: number;
}

/** Icon color + soft tile background per stage key. Keeps the funnel coherent
 * with `application-funnel.tsx` while staying readable on white. */
const STAGE_TINTS: Record<string, { color: string; bg: string }> = {
  applied:   { color: "var(--info)",            bg: "var(--info-soft)" },
  screened:  { color: "var(--accent-strong)",   bg: "var(--primary-soft)" },
  interview: { color: "#6d28d9",                bg: "#ede9fe" },
  offer:     { color: "var(--success)",         bg: "var(--success-soft)" },
};
const FALLBACK_TINT = { color: "var(--ink-2)", bg: "var(--bg-2)" } as const;

/**
 * Visual funnel that shows how applications progress through stages.
 * Each tile shows its cumulative count and the conversion rate from the
 * previous stage. Arrow connectors between tiles make the flow explicit.
 */
export function ApplicationsPipeline({ stages, total }: ApplicationsPipelineProps) {
  return (
    <section className="card" style={{ marginBottom: 24, padding: "var(--pad)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 18,
          gap: 12,
        }}
      >
        <div>
          <p className="card-title">Pipeline</p>
          <p className="card-lead">Funnel snapshot</p>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--ink-3)" }}>
          {total} total application{total === 1 ? "" : "s"}
        </p>
      </header>

      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: 10,
        }}
      >
        {stages.map((stage, idx) => {
          const prev = idx > 0 ? stages[idx - 1].count : null;
          const conversion =
            prev != null && prev > 0 ? Math.round((stage.count / prev) * 100) : null;
          const pctOfTotal = total > 0 ? Math.round((stage.count / total) * 100) : 0;
          // The first stage is the funnel top — its %-of-total is always 100
          // and adds no information. Hide it (and anywhere else that's 100%).
          const showPct = idx > 0 && pctOfTotal > 0 && pctOfTotal < 100;
          const Icon = stage.icon;
          const tint = STAGE_TINTS[stage.key] ?? FALLBACK_TINT;
          const isEmpty = stage.count === 0;
          const isLast = idx === stages.length - 1;

          return (
            <PipelineItem
              key={stage.key}
              icon={Icon}
              label={stage.label}
              count={stage.count}
              pctOfTotal={pctOfTotal}
              showPct={showPct}
              tint={tint}
              isEmpty={isEmpty}
              isLast={isLast}
              conversion={conversion}
            />
          );
        })}
      </ol>
    </section>
  );
}

function PipelineItem({
  icon: Icon,
  label,
  count,
  pctOfTotal,
  showPct,
  tint,
  isEmpty,
  isLast,
  conversion,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  pctOfTotal: number;
  showPct: boolean;
  tint: { color: string; bg: string };
  isEmpty: boolean;
  isLast: boolean;
  conversion: number | null;
}) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "stretch",
        flex: "1 1 220px",
        minWidth: 200,
        gap: 10,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "14px 16px",
          background: "#fff",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          opacity: isEmpty ? 0.55 : 1,
          transition: "opacity .15s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 30,
              height: 30,
              display: "grid",
              placeItems: "center",
              borderRadius: 9,
              background: tint.bg,
              color: tint.color,
              flexShrink: 0,
            }}
          >
            <Icon size={14} />
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--ink-3)",
            }}
          >
            {label}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: isEmpty ? "var(--ink-3)" : "var(--ink)",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {count}
          </p>
          {showPct && (
            <span
              title="Share of total applications that reached this stage"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink-3)",
                background: "var(--bg-2)",
                padding: "2px 7px",
                borderRadius: 999,
              }}
            >
              {pctOfTotal}% of total
            </span>
          )}
        </div>

        <div
          aria-hidden
          style={{
            height: 4,
            borderRadius: 999,
            background: "var(--line)",
            overflow: "hidden",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              width: `${pctOfTotal}%`,
              background: isEmpty
                ? "var(--line-2)"
                : `linear-gradient(90deg, color-mix(in oklab, ${tint.color} 60%, transparent), ${tint.color})`,
              borderRadius: "inherit",
              transition: "width .6s ease",
            }}
          />
        </div>
      </div>

      {!isLast && <PipelineConnector conversion={conversion} />}
    </li>
  );
}

function PipelineConnector({ conversion }: { conversion: number | null }) {
  // Only highlight conversion when there's actual attrition. A 100% pill
  // means "everyone advanced" — true but uninformative — so we drop it and
  // let the arrow alone speak for the flow.
  const showPill = conversion != null && conversion < 100;
  return (
    <div
      aria-hidden
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        flexShrink: 0,
        width: 36,
      }}
    >
      <ArrowRight size={14} style={{ color: "var(--ink-3)", opacity: 0.6 }} />
      {showPill && (
        <span
          title="Conversion from the previous stage"
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--ink-3)",
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 999,
            padding: "1px 6px",
            whiteSpace: "nowrap",
            minWidth: 30,
            textAlign: "center",
          }}
        >
          {conversion}%
        </span>
      )}
    </div>
  );
}

export const DEFAULT_PIPELINE_STAGES = {
  applied:   { label: "Applied",   icon: FileText, statuses: ["applied", "submitted", "phone_screen", "screening", "interview", "offer", "accepted"] },
  screened:  { label: "Screened",  icon: Phone,    statuses: ["phone_screen", "screening", "interview", "offer", "accepted"] },
  interview: { label: "Interview", icon: Calendar, statuses: ["interview", "offer", "accepted"] },
  offer:     { label: "Offer",     icon: Gift,     statuses: ["offer", "accepted"] },
} as const;
