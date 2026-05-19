import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  firstName: string | null;
  stats: {
    /** Number of job matches generated for this user. */
    jobMatchCount: number;
    activeApplications: number;
  };
}

export function HeroSection({ firstName, stats }: HeroSectionProps) {
  const { jobMatchCount, activeApplications } = stats;

  return (
    <div className="hero g-hero">
      <div className="hero-left">
        <div>
          <div className="hero-kicker">Your job search, automated</div>
          <h2>
            {firstName ? (
              <>Good to see you, <em>{firstName}</em></>
            ) : (
              <>Find your <em>next role</em></>
            )}
          </h2>
          <p className="hero-desc">
            {jobMatchCount > 0
              ? `You have ${jobMatchCount} job match${jobMatchCount === 1 ? '' : 'es'} and ${activeApplications} active application${activeApplications === 1 ? '' : 's'}.`
              : 'Let your AI agent scan opportunities, tailor your résumé, and track every application — automatically.'}
          </p>
        </div>
        <div className="hero-cta">
          <Link href="/jobs" className="btn btn-primary">
            <Sparkles size={14} />
            View Matches
          </Link>
          <Link href="/applications" className="btn btn-ghost">
            Applications
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="hero-right">
        <div className="orb-wrap">
          <div className="orb">
            <div className="orb-ring" />
            <div className="orb-ring r2" />
          </div>
          {jobMatchCount > 0 && (
            <div className="orb-badge b1">
              <span className="orb-dot" />
              {jobMatchCount} match{jobMatchCount === 1 ? '' : 'es'}
            </div>
          )}
          {activeApplications > 0 && (
            <div className="orb-badge b2">
              <span className="orb-dot" style={{ background: '#4FC8A3' }} />
              {activeApplications} active
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
