import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroTicket } from "@/components/marketing/hero-ticket";
import { Loop } from "@/components/marketing/loop";
import { FeatureRows } from "@/components/marketing/feature-rows";
import { Architecture } from "@/components/marketing/architecture";
import { MarketingSignInButton } from "@/components/marketing-sign-in-button";
import { SectionLabel } from "@/components/system/section-label";
import { DrawLine, LineReveal, Rise } from "@/components/system/motion";
import { GITHUB_URL, sourceUrl } from "@/lib/marketing";

const ENGINEERING = [
  {
    title: "Pre-flight diagnostics, not stuck spinners",
    body: "POST /api/match/jobs runs an eligibility query before it triggers n8n. When the daily scrape found nothing new, you see “you’re caught up” instead of a two-minute spinner. The button tells four failure modes apart.",
    code: "app/api/match/jobs/route.ts",
  },
  {
    title: "Polling that tracks the right signal",
    body: "The matching poller used to watch only the count of pending matches. If the model rejected every candidate, the count never moved and the UI looked stuck. It now also watches the total and the last match time.",
    code: "components/find-matches-button.tsx",
  },
  {
    title: "A signed server-to-server callback",
    body: "n8n needs your original resume to keep its formatting while tailoring. Resume bytes live in Postgres, not a public bucket, and n8n reads them with a shared x-webhook-secret header, the same secret that signs outbound calls.",
    code: "lib/n8n-client.ts",
  },
  {
    title: "Third-party HTML stays sandboxed",
    body: "Prep guides and research come from n8n and an LLM, and can carry user-influenced text. They render inside an iframe with sandbox=\"\" and a fresh document, so nothing injected can reach the page around it.",
    code: "components/prep-html-viewer.tsx",
  },
] as const;

const SECURITY = [
  {
    title: "Identity comes from the session",
    body: "Every API route reads the user ID from the Clerk session on the server. The client never sends it, and routes that touch a record check you own it first.",
    code: "lib/auth.ts",
  },
  {
    title: "Validated request bodies",
    body: "Every POST body goes through a Zod schema before it reaches Prisma, and string fields are HTML-escaped.",
    code: "lib/validation.ts",
  },
  {
    title: "Headers on every response",
    body: "nosniff, DENY framing, a strict referrer policy, a locked-down permissions policy and a content security policy, set globally.",
    code: "next.config.mjs",
  },
  {
    title: "Uploads are checked, not trusted",
    body: "PDF, DOC or DOCX only, 5 MB max, verified by magic bytes rather than the declared type. The filename is sanitised and stored as a column, never used as a path.",
    code: "app/api/resume/upload/route.ts",
  },
] as const;

const STACK = [
  ["frontend", "Next.js 16 · React 19 · TypeScript · Tailwind"],
  ["auth", "Clerk"],
  ["data", "PostgreSQL on Neon · Prisma 7"],
  ["workflows", "n8n · Groq"],
  ["hosting", "Vercel"],
] as const;

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main id="top">
        {/* HERO — serif statement left, a real-shaped match ticket right */}
        <section className="px-[5vw] pb-[clamp(4rem,8vw,8rem)] pt-[clamp(3rem,7vw,7rem)]">
          <div className="grid items-start gap-[clamp(3rem,6vw,6rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <Rise inView={false}>
                <SectionLabel index="00">open source · personal project</SectionLabel>
              </Rise>
              <LineReveal
                as="h1"
                inView={false}
                delay={0.1}
                className="mt-7 font-display text-[clamp(3.5rem,9vw,9.5rem)] leading-[0.9] tracking-[-0.025em] text-ink"
                lines={[
                  "Job hunting,",
                  <em key="a" className="text-accent-ink">
                    automated.
                  </em>,
                ]}
              />
              <Rise inView={false} delay={0.5}>
                <p className="mt-8 max-w-[50ch] text-lg leading-relaxed text-ink-2">
                  Match scores open roles against your profile, rewrites your resume for each one, researches the
                  company, preps you for the interview and tracks every application, all in one place.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <MarketingSignInButton className="btn btn-primary btn-lg group">
                    Sign in to start
                    <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </MarketingSignInButton>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 underline decoration-line-strong underline-offset-8 transition-colors hover:text-ink hover:decoration-accent"
                  >
                    Read the source
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </div>
              </Rise>
            </div>

            <Rise inView={false} delay={0.35} y={28} className="lg:mt-24">
              <HeroTicket />
            </Rise>
          </div>
        </section>

        {/* WHY — one sentence, given the room */}
        <section className="border-y border-line bg-surface px-[5vw] py-[clamp(4rem,9vw,9rem)]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end lg:gap-16">
            <div>
              <SectionLabel index="01">why this exists</SectionLabel>
              <LineReveal
                className="mt-6 font-display text-[clamp(2.25rem,5vw,4.75rem)] leading-[1.02] tracking-[-0.015em] text-ink"
                lines={[
                  "Match does the parts",
                  "a computer should do,",
                  <span key="b" className="text-ink-3">
                    and shows you the rest.
                  </span>,
                ]}
              />
            </div>
            <Rise delay={0.2}>
              <p className="max-w-[40ch] leading-relaxed text-ink-2">
                Job hunting is a loop of repetitive work: scrape the boards, judge fit, rewrite the resume for each
                posting, research the company, prep, chase replies. Match automates the loop and stops wherever a
                human decision is needed.
              </p>
            </Rise>
          </div>
        </section>

        {/* THE LOOP — sticky heading, scroll-driven rail */}
        <section id="loop" className="px-[5vw] pt-[clamp(6rem,12vw,12rem)]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionLabel index="02">how it works</SectionLabel>
              <LineReveal
                className="mt-6 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1] tracking-[-0.015em] text-ink"
                lines={["Five steps,", <em key="c" className="text-accent-ink">start to offer.</em>]}
              />
              <Rise delay={0.2}>
                <p className="mt-6 max-w-[38ch] leading-relaxed text-ink-2">
                  Anything slow runs as an n8n workflow in the background. The app polls Postgres for the result, so a
                  refresh never loses your place.
                </p>
              </Rise>
            </div>
            <Loop />
          </div>
        </section>

        {/* FEATURES — expanding editorial rows */}
        <section id="features" className="px-[5vw] pt-[clamp(6rem,12vw,12rem)]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel index="03">what it does</SectionLabel>
              <LineReveal
                className="mt-6 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1] tracking-[-0.015em] text-ink"
                lines={["Five tools,", "one pipeline."]}
              />
            </div>
            <Rise delay={0.15}>
              <p className="max-w-[36ch] text-sm leading-relaxed text-ink-3">Open a row for the detail.</p>
            </Rise>
          </div>
          <FeatureRows />
        </section>

        {/* ENGINEERING — sticky heading, numbered notes, each linked to its file */}
        <section id="engineering" className="px-[5vw] pt-[clamp(6rem,12vw,12rem)]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionLabel index="04">engineering</SectionLabel>
              <LineReveal
                className="mt-6 font-display text-[clamp(2.25rem,4.4vw,4rem)] leading-[1] tracking-[-0.015em] text-ink"
                lines={["Built for the", "slow parts."]}
              />
              <Rise delay={0.2}>
                <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-ink-3">
                  Each note links to the file it describes.
                </p>
              </Rise>
            </div>
            <ol>
              {ENGINEERING.map((item, i) => (
                <li key={item.title}>
                  <DrawLine delay={i * 0.06} />
                  <Rise delay={i * 0.06} className="grid gap-3 py-8 md:grid-cols-[3rem_minmax(0,1fr)]">
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
                    <div>
                      <h3 className="text-xl font-medium tracking-[-0.01em] text-ink">{item.title}</h3>
                      <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-2">{item.body}</p>
                      <a
                        href={sourceUrl(item.code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-ink-3 transition-colors hover:text-accent-ink"
                      >
                        {item.code}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </a>
                    </div>
                  </Rise>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ARCHITECTURE — the round trip, then the stack as a ledger */}
        <section className="px-[5vw] pt-[clamp(6rem,12vw,12rem)]">
          <SectionLabel index="05">architecture</SectionLabel>
          <LineReveal
            className="mb-14 mt-6 font-display text-[clamp(2.25rem,4.4vw,4rem)] leading-[1] tracking-[-0.015em] text-ink"
            lines={["One round trip,", <span key="d" className="text-ink-3">no websockets.</span>]}
          />
          <Architecture />
          <dl className="mt-16 max-w-[44rem] font-mono text-sm">
            {STACK.map(([k, v], i) => (
              <div key={k}>
                <DrawLine delay={i * 0.06} />
                <Rise delay={i * 0.06} y={8}>
                  <div className="flex gap-6 py-3.5">
                    <dt className="w-24 shrink-0 text-ink-3">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                </Rise>
              </div>
            ))}
            <DrawLine delay={0.35} />
          </dl>
        </section>

        {/* SECURITY — statement left, a ruled table right */}
        <section id="security" className="px-[5vw] pt-[clamp(6rem,12vw,12rem)]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <div>
              <SectionLabel index="06">security</SectionLabel>
              <LineReveal
                className="mt-6 font-display text-[clamp(2.5rem,5.6vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-ink"
                lines={["Your resume.", "Your session.", <em key="e" className="text-accent-ink">Your data.</em>]}
              />
            </div>
            <ul className="border-t border-line">
              {SECURITY.map((item, i) => (
                <li key={item.title} className="border-b border-line">
                  <Rise delay={i * 0.06} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="font-medium text-ink">{item.title}</h3>
                      <a
                        href={sourceUrl(item.code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-ink-3 transition-colors hover:text-accent-ink"
                      >
                        {item.code}
                      </a>
                    </div>
                    <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-2">{item.body}</p>
                  </Rise>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CLOSE */}
        <section className="px-[5vw] pt-[clamp(7rem,14vw,14rem)]">
          <div className="flex flex-col gap-10 border-t border-line pt-12 lg:flex-row lg:items-end lg:justify-between">
            <LineReveal
              className="font-display text-[clamp(2.75rem,6.4vw,6.5rem)] leading-[0.95] tracking-[-0.02em] text-ink"
              lines={["Sign in.", <span key="f" className="text-ink-3">Drop in a resume.</span>]}
            />
            <Rise delay={0.2} className="shrink-0">
              <MarketingSignInButton className="btn btn-primary btn-lg group">
                Sign in to start
                <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
              </MarketingSignInButton>
              <p className="mt-3 font-mono text-[11px] text-ink-3">Scoring a batch of roles takes 30 to 90 seconds.</p>
            </Rise>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
