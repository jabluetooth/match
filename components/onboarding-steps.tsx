import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export type StepStatus = 'done' | 'active' | 'pending';

export interface OnboardingStep {
  num: number;
  title: string;
  desc: string;
  action: string;
  href: string;
  status: StepStatus;
}

interface OnboardingStepsProps {
  steps: OnboardingStep[];
}

export function OnboardingSteps({ steps }: OnboardingStepsProps) {
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const totalCount = steps.length;
  const isComplete = doneCount === totalCount;
  const progressPct = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="card g-onboard">
      <div className="card-head" style={{ marginBottom: 14 }}>
        <div>
          <p className="card-title">Setup progress</p>
          <p className="card-lead">{isComplete ? 'You’re all set' : 'Getting started'}</p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: isComplete ? 'var(--success-ink)' : 'var(--ink-2)',
              background: isComplete ? 'var(--success-soft)' : 'var(--bg-2)',
              padding: '4px 10px',
              borderRadius: 999,
              border: `1px solid ${isComplete ? 'transparent' : 'var(--line)'}`,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {isComplete && <Check size={12} strokeWidth={2.5} />}
            {doneCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        aria-hidden
        style={{
          height: 4,
          borderRadius: 999,
          background: 'var(--line)',
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width: `${progressPct}%`,
            background: isComplete
              ? 'linear-gradient(90deg, #4ade80, var(--success))'
              : 'linear-gradient(90deg, var(--accent-c), var(--accent-strong))',
            borderRadius: 'inherit',
            transition: 'width .6s ease',
          }}
        />
      </div>

      {isComplete ? (
        <CelebrationBlock />
      ) : (
        <div className="steps">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`step${step.status === 'done' ? ' done' : step.status === 'active' ? ' active' : ''}`}
            >
              <div className="step-num">
                {step.status === 'done' ? <Check size={14} strokeWidth={3} /> : step.num}
              </div>
              <div className="step-body">
                <p className="step-title">{step.title}</p>
                <p className="step-desc">{step.desc}</p>
              </div>
              {step.status !== 'done' && step.href && (
                <Link href={step.href} className="step-action">
                  {step.action}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CelebrationBlock() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '20px 18px',
        marginTop: 10,
        background: 'var(--success-soft)',
        border: '1px solid color-mix(in oklab, var(--success) 30%, transparent)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 44,
          height: 44,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 12,
          background: '#fff',
          color: 'var(--success)',
          border: '1px solid color-mix(in oklab, var(--success) 25%, transparent)',
          flexShrink: 0,
        }}
      >
        <Sparkles size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--success-ink)' }}>
          Setup complete — you’re fully onboarded.
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--ink-2)' }}>
          Match will keep scanning for roles and surface anything worth your attention.
        </p>
      </div>
    </div>
  );
}
