import Link from "next/link";

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
  const doneCount = steps.filter(s => s.status === 'done').length;

  return (
    <div className="card g-onboard">
      <div className="card-head">
        <div>
          <p className="card-title">Setup progress</p>
          <p className="card-lead">Getting started</p>
        </div>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--ink-3)',
          background: 'var(--bg-2)',
          padding: '4px 12px',
          borderRadius: 999,
          border: '1px solid var(--line)',
          whiteSpace: 'nowrap',
        }}>
          {doneCount} / {steps.length}
        </span>
      </div>

      <div className="steps">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`step${step.status === 'done' ? ' done' : step.status === 'active' ? ' active' : ''}`}
          >
            <div className="step-num">
              {step.status === 'done' ? '✓' : step.num}
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
    </div>
  );
}
