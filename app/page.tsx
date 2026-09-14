import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingSignInButton } from "@/components/marketing-sign-in-button";
import { HeroPreview3D } from "@/components/hero-preview-3d";
import { WhyThisExists } from "@/components/why-this-exists";
import { FeaturesBento } from "@/components/features-bento";
import { HowItWorksFlow } from "@/components/how-it-works-flow";
import { ArchitectureFlow } from "@/components/architecture-flow";
import { TechStackGrid } from "@/components/tech-stack-grid";
import { FinalCta } from "@/components/final-cta";
import { Reveal, RevealStagger, RevealItem } from "@/components/scroll-reveal";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { GITHUB_URL } from "@/lib/marketing";

const ENGINEERING_HIGHLIGHTS = [
  {
    title: "Pre-flight diagnostics, not stuck spinners",
    body: "POST /api/match/jobs runs an eligibility query before triggering n8n. When the daily scrape has produced zero new jobs, the user sees “you're caught up” instead of staring at a spinner for 2 minutes — the button distinguishes four failure modes.",
    code: "app/api/match/jobs/route.ts",
  },
  {
    title: "Polling that tracks the right signal",
    body: "The matching poller originally watched only the count of pending matches. If the AI rejected every candidate as a low score, the count never moved and the UI looked stuck. It now also watches total and lastMatchAt.",
    code: "components/find-matches-button.tsx",
  },
  {
    title: "Signed server-to-server callback",
    body: "n8n needs the user's original resume to preserve formatting during tailoring. Resume bytes live in Postgres BYTEA, not a public bucket — n8n reads them via a shared x-webhook-secret header, the same secret used to sign outbound calls.",
    code: "lib/n8n-client.ts",
  },
  {
    title: "Sandboxed third-party HTML",
    body: "Interview-prep and research HTML come from n8n and an LLM, and are user-influenced. It's rendered inside an iframe sandbox=\"\" with a fresh document, so any reflected injection can't reach the parent DOM.",
    code: "components/prep-html-viewer.tsx",
  },
] as const;

const SECURITY_HIGHLIGHTS = [
  {
    title: "Server-derived user identity, everywhere",
    body: "Every API route derives the user ID from the Clerk session server-side — the client never sends it, even when it's present in the form body. Resource-bound routes additionally verify row ownership before mutating anything.",
    code: "lib/auth.ts",
  },
  {
    title: "Zod-validated request bodies",
    body: "Every POST body is parsed through a schema before it reaches Prisma. String fields are HTML-escaped, neutralising reflected XSS that could otherwise ride in through downstream LLM output.",
    code: "lib/validation.ts",
  },
  {
    title: "Security headers set globally",
    body: "X-Content-Type-Options: nosniff, X-Frame-Options: DENY, a strict Referrer-Policy, and a locked-down Permissions-Policy apply to every response, not just the pages that seemed to need them.",
    code: "next.config.mjs",
  },
  {
    title: "Constrained file uploads",
    body: "Resume uploads are Clerk-authed, MIME-whitelisted (PDF/DOC/DOCX), capped at 5 MB, and verified by magic-byte signature, not just declared MIME type. The original filename is sanitized and length-capped before it's stored as a database column, not a filesystem path.",
    code: "app/api/resume/upload/route.ts",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <MarketingNav />

      {/* ─── Hero ─── */}
      <section id="top" className="mkt-band mkt-band-hero mkt-anchor">
        <div className="mkt-shell mkt-hero">
          <Reveal>
            <div className="mkt-eyebrow">Personal project — open source</div>
            <h1>
              Job hunting,<br /><em>automated</em>.
            </h1>
            <p className="mkt-hero-sub">
              Find matching roles, tailor your resume to each one, research the
              company, prep for the interview, and track every application
              &mdash; all in one place.
            </p>
            <div className="mkt-cta-row">
              <MarketingSignInButton className="btn btn-primary btn-lg">
                <Sparkles size={15} />
                Sign In
              </MarketingSignInButton>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                View source
                <ArrowUpRight size={15} />
              </a>
            </div>
          </Reveal>

          {/* Live preview — real component styles, not a screenshot; tilts
              in 3D under the cursor via components/hero-preview-3d.tsx */}
          <Reveal>
            <HeroPreview3D />
          </Reveal>
        </div>
      </section>

      {/* ─── Why this exists ─── asymmetric two-column pull-quote: quote
          slides in from the left, explanation from the right. */}
      <section className="mkt-band mkt-shade">
        <div className="mkt-shell">
          <Reveal>
            <div className="mkt-eyebrow">Why this exists</div>
          </Reveal>
          <WhyThisExists />
        </div>
      </section>

      {/* ─── Features ─── two homogeneous bento groups (see
          components/features-bento.tsx): 2 primary cards, then 3
          supporting ones, not 5 equal cards mixed into one grid. */}
      <section id="features" className="mkt-band mkt-anchor">
        <div className="mkt-shell">
          <Reveal>
            <div className="mkt-eyebrow">What it does</div>
          </Reveal>
          <FeaturesBento />
        </div>
      </section>

      {/* ─── How it works ─── plain-language flow, before the technical dive */}
      <section id="how-it-works" className="mkt-band mkt-shade mkt-anchor">
        <div className="mkt-shell">
          <Reveal>
            <div className="mkt-eyebrow">How it works</div>
            <p className="mkt-section-intro">
              No onboarding call, no template to fill in by hand. Five steps,
              start to offer.
            </p>
          </Reveal>
          <HowItWorksFlow />
        </div>
      </section>

      {/* ─── Engineering ─── the technical version of the flow above */}
      <section id="engineering" className="mkt-band mkt-band-textured mkt-anchor">
        <div className="mkt-shell">
          <Reveal>
            <div className="mkt-eyebrow">Engineering</div>
          </Reveal>
          <RevealStagger className="mkt-eng">
            {ENGINEERING_HIGHLIGHTS.map((item) => (
              <RevealItem className="mkt-eng-item" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
                <code>{item.code}</code>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="mkt-band mkt-shade">
        <div className="mkt-shell">
          <Reveal>
            <div className="mkt-eyebrow">Architecture</div>
            <p className="mkt-section-intro">
              A thin Next.js frontend, an n8n workflow engine for everything
              long-running, and Postgres as the source of truth in between.
            </p>
          </Reveal>

          <ArchitectureFlow />

          <Reveal>
            <TechStackGrid />
          </Reveal>
        </div>
      </section>

      {/* Own full section, same weight as Engineering highlights above it —
          not a cramped tight/no-border continuation of Architecture, which
          made sense back when this was a single item but reads as
          under-weighted now that it's an equally substantial 4-item list.
          Unshaded (bg) continues the page's alternating rhythm against
          Architecture's shaded band; Final CTA right after is also bg, so
          Security now flows straight into the closing CTA. */}
      <section className="mkt-band mkt-band-textured">
        <div className="mkt-shell">
          <Reveal>
            <div className="mkt-eyebrow">Security</div>
          </Reveal>
          <RevealStagger className="mkt-eng">
            {SECURITY_HIGHLIGHTS.map((item) => (
              <RevealItem className="mkt-eng-item" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
                <code>{item.code}</code>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="mkt-band mkt-band-tight">
        <div className="mkt-shell">
          <FinalCta />
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
