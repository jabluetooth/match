# Match — Development Phases

> Audit completed 2026-04-29. All issues sourced from comparing `components/Match (2).json` (n8n workflow) against the frontend codebase.

---

## Phase 1 — Bug Fixes & Security (do first, nothing else builds on broken ground)

| # | File | Fix | Status |
|---|---|---|---|
| 1.1 | `app/applications/page.tsx:143` | `app.job.company` → `app.job.companyName` | ✅ done |
| 1.2 | `lib/n8n-client.ts:61` | Remove or remap `scrapeJobs()` — no `scrape-jobs` webhook exists; it's a cron-only trigger | ✅ done |
| 1.3 | `components/followup-card.tsx` | Added `useRouter` + `router.refresh()` after successful response; also applied `TIMEOUT_MS` to long-running n8n calls | ✅ done |
| 1.4 | `app/research/[jobId]/page.tsx:14` | Replace `?user_id=` query-param auth with `requireUserWithSync()` from Clerk | ✅ done |

---

## Phase 2 — Wire Up Application Tracking (the workflow's biggest gap)

`ApplicationActions` component is fully built but mounted nowhere. The entire `application-tracker` n8n webhook (`create`, `update_status`, `schedule_interview`) is unreachable from the UI.

| # | Task | Status |
|---|---|---|
| 2.1 | Add **"Apply"** button to `JobMatchCard` — calls `action: create` via `/api/track/application` | ✅ done |
| 2.2 | Wire the dead `ArrowUpRight` button in `app/applications/page.tsx` — replaced with `ApplicationRowActions` status dropdown | ✅ done |
| 2.3 | Add **"Schedule Interview"** modal to `app/interviews/page.tsx` — `ScheduleInterviewModal` replaces the dead "Schedule new" button | ✅ done |

---

## Phase 3 — Company Research Entry Point

The `company-research` n8n webhook and `/api/research/company` route exist but no UI calls them.

| # | Task | Status |
|---|---|---|
| 3.1 | Add **"Research Company"** button to `JobMatchCard` — POST to `/api/research/company` with `job_id`, then link to `/research/[jobId]` | ✅ done |
| 3.2 | Add **"Research Company"** action to the application row actions in `app/applications/page.tsx` | ⬜ pending |

---

## Phase 4 — Interview Prep Viewer

The workflow saves `html_content` + `pdf_binary` to `interview_prep` table and emails the PDF. There's no in-app way to re-open or re-download it.

| # | Task | Status |
|---|---|---|
| 4.1 | Create `/api/interview-prep/[id]/download` route — fetch `html_content` from DB, re-render via PDFShift, stream PDF | ✅ done |
| 4.2 | Create `app/interview-prep/[id]/page.tsx` — render `html_content` inline (iframe or sanitised HTML) with a Download PDF button | ✅ done |
| 4.3 | Link from the interview card in `app/interviews/page.tsx` to the prep viewer once prep is generated | ✅ done |

---

## Phase 5 — Follow-up Creation

The n8n workflow handles follow-up **responses** only. There is no webhook, API route, or UI to **create** a follow-up.

| # | Task | Status |
|---|---|---|
| 5.1 | Design the follow-up creation data model (which fields, how it maps to `follow_up_log`) | ⬜ pending |
| 5.2 | Add n8n webhook node `POST followup-create` (or handle directly in Next.js via Prisma) | ⬜ pending |
| 5.3 | Create `/api/followup/create` route | ⬜ pending |
| 5.4 | Wire the **"Add follow-up"** button in `app/followups/page.tsx` to a form/modal that calls the new route | ⬜ pending |

---

## Phase 6 — n8n Workflow Cleanup

Inconsistencies found inside the workflow itself.

| # | Issue | Fix | Status |
|---|---|---|---|
| 6.1 | Company research node uses `a.job_match_id` — column is actually `job_id` in `applications` table | Fix SQL in **"Get Application + Job (by app_id)1"** node | ⬜ pending |
| 6.2 | Two nearly identical job-matching webhooks (`match-job` today-only vs `match-jobs` 7-day window) — only `match-job` is called from the UI | Decide canonical flow; delete or redirect the unused one | ⬜ pending |

---

## Legend

| Symbol | Meaning |
|---|---|
| ⬜ pending | Not started |
| 🔄 in progress | Active work |
| ✅ done | Shipped |
| ❌ blocked | Waiting on decision or dependency |
