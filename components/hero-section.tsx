import Link from "next/link";
import Image from "next/image";
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
        <div
          style={{
            position: "relative",
            width: "min(260px, 80%)",
            aspectRatio: "4 / 3",
            display: "grid",
            placeItems: "center",
            filter: "drop-shadow(0 20px 40px rgba(99, 102, 241, 0.35))",
          }}
        >
          <Image
            src="/brand/match-mark.svg"
            alt="Match"
            width={260}
            height={195}
            priority
            style={{
              width: "100%",
              height: "auto",
              animation: "match-mark-float 6s ease-in-out infinite",
            }}
          />

          {jobMatchCount > 0 && (
            <div
              className="orb-badge"
              style={{ position: "absolute", top: 8, left: -10 }}
            >
              <span className="orb-dot" />
              {jobMatchCount} match{jobMatchCount === 1 ? '' : 'es'}
            </div>
          )}
          {activeApplications > 0 && (
            <div
              className="orb-badge"
              style={{ position: "absolute", bottom: 12, right: -8 }}
            >
              <span className="orb-dot" style={{ background: '#4FC8A3' }} />
              {activeApplications} active
            </div>
          )}
        </div>

        <style>{`
          @keyframes match-mark-float {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-8px); }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="match-mark-float"] { animation: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
