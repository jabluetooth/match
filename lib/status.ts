/**
 * One place that knows what every application status means: its label, how
 * far along the pipeline it is, and which tone it gets. The applications
 * list, the dashboard, and the stage rail all read from here, so a status
 * can't be "Interview" on one page and "Phone screen" on another.
 */

export type StatusTone = "neutral" | "accent" | "interview" | "success" | "danger";

/** The four stages the pipeline rail draws, in order. */
export const STAGES = ["applied", "screened", "interview", "offer"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  applied: "Applied",
  screened: "Screened",
  interview: "Interview",
  offer: "Offer",
};

/**
 * Cumulative pipeline counts: an application counts toward every stage it
 * has passed, so a final-round interview is also "applied" and "screened".
 */
export const STAGE_STATUSES: Record<Stage, readonly string[]> = {
  applied: ["applied", "submitted", "phone_screen", "screening", "interview", "final_round", "offer", "accepted"],
  screened: ["phone_screen", "screening", "interview", "final_round", "offer", "accepted"],
  interview: ["interview", "final_round", "offer", "accepted"],
  offer: ["offer", "accepted"],
};

/** Build the four rail stages from a list of application statuses. */
export function pipelineStages(statuses: string[]) {
  return STAGES.map((key) => ({
    key,
    label: STAGE_LABEL[key],
    count: statuses.filter((s) => STAGE_STATUSES[key].includes(s)).length,
  }));
}

interface StatusMeta {
  label: string;
  /** Index into STAGES of the furthest stage reached, or -1 before applying. */
  stage: number;
  tone: StatusTone;
  closed?: boolean;
}

const STATUS: Record<string, StatusMeta> = {
  draft: { label: "Draft", stage: -1, tone: "neutral" },
  interested: { label: "Interested", stage: -1, tone: "neutral" },
  active: { label: "Active", stage: -1, tone: "neutral" },
  applied: { label: "Applied", stage: 0, tone: "accent" },
  submitted: { label: "Applied", stage: 0, tone: "accent" },
  phone_screen: { label: "Phone screen", stage: 1, tone: "accent" },
  screening: { label: "Phone screen", stage: 1, tone: "accent" },
  interview: { label: "Interview", stage: 2, tone: "interview" },
  final_round: { label: "Final round", stage: 2, tone: "interview" },
  offer: { label: "Offer", stage: 3, tone: "success" },
  accepted: { label: "Accepted", stage: 3, tone: "success" },
  rejected: { label: "Rejected", stage: -1, tone: "danger", closed: true },
  withdrawn: { label: "Withdrawn", stage: -1, tone: "neutral", closed: true },
};

export function statusMeta(status: string): StatusMeta {
  return STATUS[status] ?? { label: status.replace(/_/g, " "), stage: -1, tone: "neutral" };
}

/** Literal class strings so Tailwind generates them (never build these with string ops). */
export const TONE_CLASS: Record<StatusTone, { text: string; dot: string; soft: string }> = {
  neutral: { text: "text-ink-2", dot: "bg-ink-2", soft: "bg-raised border-line" },
  accent: { text: "text-accent-ink", dot: "bg-accent", soft: "bg-accent/10 border-accent/25" },
  interview: { text: "text-interview-ink", dot: "bg-interview", soft: "bg-interview/15 border-interview/30" },
  success: { text: "text-success", dot: "bg-success", soft: "bg-success/10 border-success/25" },
  danger: { text: "text-danger", dot: "bg-danger", soft: "bg-danger/10 border-danger/25" },
};
