# Match

AI-powered career management dashboard — job matching, application tracking, resume tailoring, and interview prep, orchestrated by an n8n workflow backend.

Built with Next.js 16 (App Router) + React 19 + Prisma + Clerk + Tailwind.

---

## Quick start

```bash
git clone <your-fork>
cd match
npm install
cp .env.example .env       # then fill in the values (see below)
npm run db:push            # push the Prisma schema to your database
npm run dev                # http://localhost:3000
```

Sign in with Clerk, drop a PDF resume in **Settings**, then click **Find New Matches** on the Jobs page.

---

## Tech stack

| Layer        | Choice                                                |
| ------------ | ----------------------------------------------------- |
| Framework    | Next.js 16 (App Router, RSC + server actions)         |
| UI           | React 19, Tailwind CSS, Radix primitives, lucide icons |
| State        | Zustand (toast store)                                 |
| Database     | PostgreSQL via Prisma 7                               |
| Auth         | Clerk                                                 |
| Automation   | n8n webhooks (resume tailor, company research, etc.)  |
| PDFs         | PDFShift (server-side render)                         |
| Charts       | Recharts                                              |
| Deployment   | Vercel + Neon (Postgres)                              |

---

## Setup

### Prerequisites

- Node.js **18+**
- A PostgreSQL database — Neon is recommended for Vercel deployments
- A [Clerk](https://dashboard.clerk.com) application (free tier is fine)
- An n8n instance reachable from your app (self-hosted or cloud)
- A [PDFShift](https://pdfshift.io) API key (optional; only needed for tailored-resume PDF generation)

### 1. Clone & install

```bash
git clone <your-fork>
cd match
npm install
```

`postinstall` runs `prisma generate` automatically so the Prisma client is ready immediately.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with the values described in [Environment variables](#environment-variables) below.

### 3. Database

```bash
npm run db:push        # creates tables from prisma/schema.prisma
npm run db:studio      # optional GUI to browse data
```

If you prefer migrations, swap `db:push` for `prisma migrate dev`.

### 4. n8n workflow

Import `components/Match (2).json` (the workflow export) into your n8n instance. It exposes the six webhooks the app calls:

- `tailor-resume`
- `company-research`
- `application-tracker`
- `followup-response`
- `interview-prep`
- `match-job`

In **dev mode**, Match calls n8n's `/webhook-test/...` URLs (so you can use the editor's "Listen for test event" button). In **production** (`NODE_ENV=production`), it switches to `/webhook/...`. Override with `N8N_FORCE_TEST_WEBHOOKS=true|false`.

### 5. Run

```bash
npm run dev            # development
npm run build && npm start   # production locally
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string. **Use the pooled URL on Vercel** (Neon: append `-pooler` to the hostname). |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key. |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key. |
| `N8N_BASE_URL` | ✅ | Root URL of the n8n instance (no trailing slash). |
| `N8N_API_KEY` | ⚪ | Required only for `n8nClient.getExecutionStatus()` (Slice-3 status polling). |
| `N8N_WEBHOOK_SECRET` | ✅ in prod | Shared secret sent as `x-webhook-secret` on every outbound n8n webhook call and required on the `/api/internal/resume/[userId]` callback. Configure the same value on the n8n side (Webhook node → Authentication: Header Auth, or an IF node check). |
| `N8N_FORCE_TEST_WEBHOOKS` | ⚪ | `true` to force `/webhook-test/` URLs even in production; `false` to force `/webhook/` even in dev. Default: dev→test, prod→prod. |
| `PDFSHIFT_API_KEY` | ⚪ | Needed for `/api/tailor/resume/[jobId]/download` to render tailored resumes to PDF. |
| `NEXT_PUBLIC_APP_URL` | ⚪ | Public origin of this app — used to build the callback URL n8n hits to fetch original-resume bytes. Set to your Vercel domain in production (e.g. `https://match.example.com`). Defaults to `http://localhost:3000`. |

The Clerk middleware (`middleware.ts`) protects everything except `/sign-in`, `/sign-up`, `/api/webhooks/*`, and `/api/internal/*` (the latter is authed via `N8N_WEBHOOK_SECRET`). Unauthenticated requests to any other API route return `401`.

### Resume storage

Base resumes are stored as BYTEA on the `user_profiles` row (`base_resume_data` + metadata columns). Run `prisma/migrations/resume_blob_columns.sql` once against your Postgres before deploying — the previous filesystem-based flow (`public/uploads/resumes/*`) breaks on Vercel's read-only serverless filesystem (`ENOENT: mkdir '/var/task/public'`).

n8n fetches the original resume via `GET /api/internal/resume/[userId]` (binary by default, or `?format=json` for base64 + metadata), passing the shared `x-webhook-secret` header. The tailor-resume webhook payload now includes `preserve_format: true` and `resume_fetch_url` — update the n8n workflow to read the original via that URL and produce a tailored copy that keeps the original layout/structure with only the content rewritten for the job.

---

## Project structure

```
app/
├── api/                       # All API routes are auth'd via Clerk
│   ├── followup/response/     # Log replies; recompute response rate
│   ├── interview-prep/        # Trigger n8n + serve generated PDFs
│   ├── interviews/            # Fetch interviews for the user
│   ├── match/jobs/            # Trigger n8n job-matching workflow
│   ├── profile/update/        # Save profile (zod-validated)
│   ├── research/company/      # Trigger + read company research
│   ├── resume/                # upload / delete / file (serve inline)
│   ├── tailor/resume/         # Trigger tailoring + status + PDF download
│   └── track/application/     # Create / update_status / schedule_interview
├── applications/              # Pipeline + search + status filter
├── followups/                 # Follow-up list with response tracking
├── interview-prep/[id]/       # In-app prep viewer (sandboxed iframe)
├── interviews/                # Upcoming + past, schedule modal
├── jobs/                      # Match cards + search + filters
├── research/[jobId]/          # Company research report viewer
├── settings/                  # Profile, resume upload, preferences
├── layout.tsx                 # Header + Toaster + NavDock
├── loading.tsx                # Brand "Match…" route loader
└── page.tsx                   # Dashboard

components/
├── ui/                        # Toast, Dock, BrandLoader (shared primitives)
├── applications-pipeline.tsx  # 4-stage funnel with conversion connectors
├── applications-list.tsx      # Client-side filter + result rows
├── application-funnel.tsx     # Dashboard variant of the funnel
├── header.tsx                 # Server component: brand + NotificationsPopover
├── hero-section.tsx           # Dashboard hero with floating orb
├── jobs-search.tsx            # URL-state search + filter pills
├── notifications-popover.tsx  # Bell + dropdown of actionable items
├── onboarding-steps.tsx       # Getting Started checklist
├── prep-html-viewer.tsx       # Sandboxed iframe for n8n-generated HTML
├── settings-form.tsx          # Drag-drop upload + chip-style tag inputs
├── workflow-loader.tsx        # Branded full-screen loader for n8n calls
└── …

lib/
├── auth.ts                    # requireAuth / requireUserWithSync / verifyOwnership
├── n8n-client.ts              # Typed webhook wrapper with timeouts
├── notifications.ts           # Server fn for the bell dropdown
├── prisma.ts                  # Prisma singleton
├── utils.ts                   # cn(), formatRelativeTime, formatCurrency
└── validation.ts              # Zod schemas + sanitizeString

hooks/
├── use-toast.ts               # Zustand store + toast.success/error/info API
└── useInterviewPrep.ts        # Client hook for /api/interview-prep

prisma/
└── schema.prisma              # 14 models: users, jobs, applications, etc.
```

---

## Features

- **Dashboard** — hero stats (open applications, upcoming interviews), 4-stage funnel, onboarding checklist with completion celebration, recent matches, activity feed.
- **Jobs** — AI-scored matches with skill chips, resume tailoring (n8n + PDFShift), company research, one-click "Apply." URL-state search + filter pills.
- **Applications** — horizontal pipeline (Applied → Screened → Interview → Offer) with per-stage conversion rates, segmented status tabs, status dropdown per row.
- **Interviews** — upcoming/past list, schedule-interview modal, AI prep generation.
- **Interview prep viewer** — n8n-generated HTML rendered in a sandboxed iframe; download as PDF.
- **Follow-ups** — log responses (replied / no response / bounced); response-rate is recomputed server-side.
- **Settings** — drag-drop resume upload (PDF/DOC/DOCX, 5 MB cap), profile + preferences, validated server-side with zod.
- **Notifications** — bell shows real signals: interviews within 7 days, follow-ups awaiting reply, fresh job matches.

---

## Deployment

### Vercel

1. Push the repo to GitHub.
2. **New Project** → import the repo. Vercel auto-detects Next.js.
3. Add the env vars listed above. For `DATABASE_URL`, paste your Neon **pooled** connection string.
4. Click Deploy. The `build` script runs `prisma generate && next build`.
5. Configure Clerk's allowed origin to include your Vercel domain.
6. Update your n8n webhook nodes' base URLs if needed.

### Resume file storage

Resume bytes live in Postgres on `user_profiles.base_resume_data` (BYTEA + metadata columns). Before deploying, run [prisma/migrations/resume_blob_columns.sql](prisma/migrations/resume_blob_columns.sql) against your DB once — see the "Resume storage" section above for the rationale.

### Other platforms

The app is plain Node + Postgres; it'll run anywhere Node.js does — Railway, Render, Fly.io, your own server. Just make sure to set the same env vars and run `prisma generate` during the build.

---

## Development workflow

```bash
npm run dev            # dev server on :3000
npm run build          # prisma generate + next build
npm run start          # serve the production build locally
npm run lint           # next lint
npm run db:generate    # regenerate the Prisma client
npm run db:push        # push schema changes to the DB without migrations
npm run db:studio      # Prisma Studio (DB inspector)
```

Useful files when planning work:

- [PHASES.md](PHASES.md) — n8n-workflow audit and the 6-phase plan to close the gaps the audit found.
- [SECURITY.md](SECURITY.md) — current security posture + outstanding items.
- [PERFORMANCE.md](PERFORMANCE.md) — where to look first when things feel slow.

---

## Security considerations

- **All API routes** authenticate via `requireAuth()` from [lib/auth.ts](lib/auth.ts). Resource-bound routes additionally call `verifyOwnership()`. The client never sends a `user_id` field — it's always derived from the Clerk session server-side.
- **Input validation** — POST bodies are parsed through zod schemas in [lib/validation.ts](lib/validation.ts). String fields are HTML-escaped via `sanitizeString()` before reaching Prisma.
- **HTML rendering** — n8n-generated HTML (interview prep, etc.) is rendered inside a `sandbox=""` iframe via [components/prep-html-viewer.tsx](components/prep-html-viewer.tsx) so any reflected XSS is isolated from the parent document.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` are set globally in [next.config.mjs](next.config.mjs).
- **Resume uploads** — Clerk-authenticated, filename pinned to the authenticated `userId` (not client-supplied), MIME-type whitelist (`application/pdf`, `application/msword`, …), 5 MB cap, path-traversal blocked.

Pending hardening (tracked in [SECURITY.md](SECURITY.md)): rate limiting, CSRF tokens on mutations, full Content-Security-Policy, database row-level security.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Unauthorized` on every API call | Clerk env vars missing or `middleware.ts` matcher not running. Check that the Clerk dashboard's allowed origin includes your dev URL. |
| Resume uploads "succeed" but **View** 404s | You're deployed on Vercel — local-disk storage is read-only there. See the storage warning under [Deployment](#vercel). |
| `tsc` errors in `.next/dev/types/validator.ts` | Stale Next.js generated types after a dev-server crash. `rm -rf .next/dev/types && npx tsc --noEmit`. |
| n8n calls 404 in dev | Default is to use `/webhook-test/...` URLs. Open the n8n editor and click **"Listen for test event"** on the relevant webhook, or set `N8N_FORCE_TEST_WEBHOOKS=false` to hit production URLs. |
| `Loader2 import` style errors | The dev server's Turbopack cache can wedge after switching branches. Stop the server, `rm -rf .next`, restart. |
| Pages feel slow in dev | `npm run dev` is intentionally unoptimized. Try `npm run build && npm start` to compare. Also confirm you're using Neon's **pooled** connection string. |

---

## License

MIT.
