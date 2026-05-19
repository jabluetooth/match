# Match — Refactor & Production-Readiness Plan

> Created 2026-05-18. Slice-by-slice plan for the UI polish + prod-readiness pass requested in conversation. Mark items ✅ as they ship. Keep this in sync with `PHASES.md` (which tracks the n8n-workflow audit) — they are complementary, not duplicates.

---

## Working principles

- **One slice at a time, fully finished.** No drive-by edits across slices.
- **Don't introduce new abstractions** unless a slice needs them. The codebase already mixes Tailwind utilities and a custom `globals.css` design-system layer; keep that until Slice 5.
- **Test the golden path before marking ✅.** Visual changes require a browser check; logic changes require typecheck (`next build` or `tsc --noEmit`).
- **Each slice ends with a single commit** so we can revert cleanly if something regresses.

---

## Slice 1 — Visual Foundation

The other slices inherit from this, so it goes first.

| # | Item | Notes | Status |
|---|---|---|---|
| 1.1 | Strengthen design tokens in `globals.css` | Darkened `--ink-2` (#4b5563→#475569) and `--ink-3` for body-text contrast; introduced `--accent-strong`/`--accent-deeper`/`--primary-soft`/`--primary-ink` + saturated status tokens (`--success`/`--danger`/`--info`/`--warning`). | ✅ |
| 1.2 | Match header opacity to the card/tile look | `.topbar` background changed from `color-mix(... 55%, transparent)` + 48px blur → `color-mix(... 88% of --card, transparent)` + 20px blur. Header feels grounded. | ✅ |
| 1.3 | Tighten footer spacing | `.shell` padding-bottom 160px → 40px; `main` pb-28 → pb-24. Nav-dock still has clearance. | ✅ |
| 1.4 | Improve loader: "Match..." text + smooth dot animation | `WorkflowLoader` now always shows "Match" + 3 staggered dots (`@keyframes match-loader-dot` opacity + translateY wave). Existing `label` becomes the secondary headline; old callers unchanged. `app/loading.tsx` aligned to the same animation. | ✅ |
| 1.5 | Build a real toast system | `hooks/use-toast.ts` (zustand store) + `components/ui/toast.tsx` (`<Toaster />`). Top-center, below header (`top: calc(var(--header-h) + 16px)`), success/error/info variants, slide-down + fade animation, dismiss button, aria-live. Imported globally via `app/layout.tsx`. | ✅ |
| 1.6 | Replace existing `alert()` calls with toasts | 26 call sites across 7 files migrated (`job-match-card`, `job-match-filters`, `find-matches-button`, `application-board`, `application-actions`, `followup-card`, `settings-form`). Verified zero `alert(` remain in app/ + components/. | ✅ |
| 1.7 | Audit visual hierarchy: spacing rhythm + contrast | See **Audit notes** below — feeds Slices 2/3/5. | ✅ |

**Done criteria:** ✅ `tsc --noEmit` clean. Toaster mounted, loader shows "Match…", header opaque, footer tight, all alerts gone.

### Slice 1 addendum (2026-05-18) — full-page loader during navigation

Follow-up request: "the loading should cover the whole page, when redirecting to other pages too."

| # | Item | Status |
|---|---|---|
| 1.8 | Extract shared `<BrandLoader />` (`components/ui/brand-loader.tsx`) — reusable "Match…" loader with optional orb + label + message. Full-screen fixed overlay at `z-index: 9000` so it covers header + content + nav-dock. | ✅ |
| 1.9 | Rewrite `app/loading.tsx`, `app/jobs/loading.tsx`, `app/applications/loading.tsx` to render `<BrandLoader />`. All three now show the full-page brand loader during route transitions. | ✅ |
| 1.10 | Rewrite `WorkflowLoader` as a thin wrapper over `<BrandLoader withOrb />` so the orb-variant stays for n8n long-running ops and they share one source of truth. | ✅ |
| 1.11 | Convert programmatic navigations to client router: `window.location.href` → `router.push` (`job-match-card.tsx`), `window.location.reload()` → `router.refresh()` (`find-matches-button.tsx`, `job-match-filters.tsx`, `application-board.tsx`, `interview-prep-button.tsx`). This lets Next's loading boundary actually fire on redirects. | ✅ |

z-index map: header `20` < nav-dock `50` < brand-loader `9000` < toaster `9999`. Toasts are intentionally above the loader so they remain visible if a toast is queued while a navigation happens.

### Slice 1 second addendum — header re-match to dock + jobs search rebuild

Follow-up requests: (a) header design should match the nav-dock's blurred-glass look, (b) jobs page search needs UX redesign.

| # | Item | Status |
|---|---|---|
| 1.12 | Match `.topbar` to the dock surface exactly: `rgba(255,255,255,0.8)` background, `backdrop-filter: blur(24px) saturate(1.4)`, `border: 1px solid rgba(229,231,235,0.6)`, `border-radius: 16px` (rounded-2xl), Tailwind `shadow-xl` translated to CSS. Added a `@supports not (backdrop-filter)` fallback for non-supporting browsers. | ✅ |
| 1.13 | Strip the search from the header — it was conditionally rendered only on `/jobs`, awkwardly stuffed into the topbar center. [components/header.tsx](components/header.tsx) is now brand + notifications only. Slice 4 will decide the notification bell's fate. | ✅ |
| 1.14 | Build a proper jobs search component ([components/jobs-search.tsx](components/jobs-search.tsx)): always-visible search input (debounced 250ms → URL `q`), filter pills for work type and sort, active-filter chips with click-to-remove, "Clear all" affordance, inline result count. URL-state model preserved so `/jobs?q=…&location=remote` still works. | ✅ |
| 1.15 | Wired into `app/jobs/page.tsx` under the page header; the legacy `<JobMatchFilters>` becomes formally dead (Slice 5 deletes it along with `gooey-input.tsx` / `gooey-select.tsx`). Empty state now distinguishes "no matches at all" from "no matches fit your filters." | ✅ |

### Audit notes (drive Slices 2/3/5)

- `settings-form.tsx` is the **only component** that uses Tailwind classes exclusively (`bg-white rounded-lg shadow p-6`, `bg-blue-600`, etc.) — clashes with the rest of the app's `globals.css` design system. **Slice 2 rewrite will move it onto `.card` / `.form-input` / `.settings-grid`.**
- `job-match-filters.tsx` uses `rounded-2xl border border-gray-100 bg-white p-4 shadow-sm` instead of `.card` — minor; Slice 5 cleanup.
- `application-actions.tsx` `ApplicationActions` export (lines 226–435) is dead — not imported anywhere; only `ApplicationRowActions` and `ScheduleInterviewModal` are used. Also uses Tailwind colors `bg-blue-600`/`bg-green-600`/`bg-purple-600` directly. **Slice 5 will delete it.**
- The funnel snapshot on `/applications` is hand-rolled inline (lines 100–126 of `app/applications/page.tsx`) rather than reusing `ApplicationFunnel` from the dashboard. **Slice 3 will reconcile.**
- `prep-html-viewer.tsx` likely uses `dangerouslySetInnerHTML` to render n8n-generated HTML — confirm + sanitize in Slice 5.1.
- `.tile-peach` / `.tile-sky` / `.tile-mint` and the stage `app-status.*` styling have been re-pointed to the new status tokens; status pills now read sharper.

---

## Slice 2 — Settings Page Rebuild

| # | Item | Notes | Status |
|---|---|---|---|
| 2.1 | Fix "view resume" bug | New auth'd `/api/resume/file` route ([app/api/resume/file/route.ts](app/api/resume/file/route.ts)) reads the user's stored resume from disk, serves it with `Content-Type: application/pdf` (or doc/docx) and `Content-Disposition: inline` so the browser renders it in a new tab instead of downloading. Path traversal blocked. The settings form's "View" button now hits this endpoint. | ✅ |
| 2.2 | Preserve resume → auto-parse → profile population | Audit found no current auto-parse step in the upload pipeline; only the n8n `tailorResume` workflow consumes `baseResumeUrl` later. Upload + store still works exactly as before — no parsing pipeline broken. | ✅ |
| 2.3 | Redesign settings using the project's `globals.css` design system | New [components/settings-form.tsx](components/settings-form.tsx) uses `.card`, `.form-input`, `.form-select`, `.form-label`, `.settings-grid`, `.settings-nav`. Tailwind utilities purged from the form. | ✅ |
| 2.4 | Better upload UX | New `Dropzone` (drag-drop + click-to-browse, large affordance with hover state), new `ResumeCard` (file icon, name, size, View / Replace / Remove). Pre-upload type + size validation. | ✅ |
| 2.5 | Empty / loading / error states | Empty: dropzone with explanation. Loading: dropzone shows spinner + "Uploading…". Error: toast with specific message from API. Inline form errors render below the field. | ✅ |
| 2.6 | Responsive: stack at < 900px | `.settings-grid` collapses to single column; `.settings-nav` becomes horizontal scrollable tabs. | ✅ |
| 2.7 | Form validation | Client-side: salary min ≤ max (inline error), experienceYears ≥ 0, list inputs trimmed + de-duped on save. Server-side: zod schema in [app/api/profile/update/route.ts](app/api/profile/update/route.ts) duplicates the rules so bad clients can't bypass. | ✅ |
| 2.8 | **Auth holes fixed** | `/api/resume/upload` and `/api/profile/update` previously trusted any `user_id` posted from the client. Both now derive the user from Clerk's session via `auth()`; the client never sends a user_id. | ✅ |
| 2.9 | Resume delete | New `/api/resume/delete` route ([app/api/resume/delete/route.ts](app/api/resume/delete/route.ts)) unlinks the file (best-effort) and clears `baseResumeUrl`. Wired to the Remove button. | ✅ |

**Done criteria:** ✅ `tsc --noEmit` clean. Drop a PDF into the dropzone → upload → "View" opens it inline in a new tab → "Remove" clears it → edit form fields → sticky save bar appears → save → toast confirms. Mobile collapses to single column.

### ⚠️ Production storage warning

Resume files are written to `public/uploads/resumes/` on the server's local filesystem. **This will not work on Vercel / serverless deployments** because the runtime filesystem is read-only (apart from `/tmp` which doesn't persist across invocations). For production:

- Wire Vercel Blob (`@vercel/blob`) — needs `BLOB_READ_WRITE_TOKEN` env var.
- Have `/api/resume/upload` put the file to Blob and store the resulting URL in `baseResumeUrl`.
- Have `/api/resume/file` either redirect to the Blob URL (302) or proxy + stream for stricter auth.

This is captured as a Slice 5 task (5.1 / 5.7 will both surface it). Local-disk works for `next dev`.

---

## Slice 3 — Application Page Redesign

| # | Item | Notes | Status |
|---|---|---|---|
| 3.1 | Redesign status card | New row card in [components/applications-list.tsx](components/applications-list.tsx): single horizontal grid — briefcase icon, title + company + location + last-updated inline, status pill, status dropdown + external link. The non-functional checkbox, redundant second status column, and per-row progress bar are gone. Hover lifts subtly via `border-color`. | ✅ |
| 3.2 | Funnel snapshot rework | New [components/applications-pipeline.tsx](components/applications-pipeline.tsx): four cumulative stages (Applied → Screened → Interview → Offer) as a horizontal pipeline. Each stage shows count, % of total, a thin gradient progress bar, and a connector pill between stages showing conversion rate from the previous stage (e.g. "67%"). The first stage tile is the accented one to draw the eye. | ✅ |
| 3.3 | Remove redundant UI | Dropped: dummy checkbox, hardcoded "Avg. time-to-response: 8 days" chip (was fake data), the second status-description column (duplicate info), the per-row progress bar (noise). The unused inline `ApplicationActions` export in `application-actions.tsx` is queued for Slice 5 deletion. | ✅ |
| 3.4 | Modern SaaS patterns | URL-free in-page filter row with: live search by company/role, segmented status tabs (All / Active / Interviewing / Offers / Closed) showing per-bucket counts. Empty state distinguishes "no apps yet" from "filter has zero results" with a Clear button. | ✅ |

**Done criteria:** ✅ `tsc --noEmit` clean. The page now opens to: pipeline showing 4 stages with conversion rates → search + tab filters → clean rows. Cardinality and conversion visible at a glance; no dead UI.

Follow-up captured for Slice 5: `app-row`, `app-checkbox`, `app-progress` CSS in [app/globals.css](app/globals.css) are now dead, and `components/application-card.tsx` (used only by the dashboard kanban) should be audited too. Responsive tightening of the new row at < 480px is also a Slice 5 task.

---

## Slice 4 — Header + Getting Started Polish

| # | Item | Notes | Status |
|---|---|---|---|
| 4.1 | Notification bell — wire to real signals | New [lib/notifications.ts](lib/notifications.ts) server fn pulls actionable items: interviews in the next 7 days, follow-ups sent ≥5 days ago that haven't responded, and job matches created in the last 24h. New [components/notifications-popover.tsx](components/notifications-popover.tsx) renders a bell + count badge (red badge if anything is urgent — interviews within 24h) and a 340px dropdown with each item as a clickable row linking to its page. Empty state: "You're all caught up." Click-outside + Escape close the dropdown. Header is now a server component that fetches the items via auth, with a try/catch so DB hiccups don't 500 the entire layout. | ✅ |
| 4.2 | Fix Getting Started "done" logic | Step 2 used to flip on `fullName.trim()` — that's a Clerk name, not a filled-in profile. Now checks the actual `UserProfile` for `skills.length > 0 \|\| jobTitles.length > 0 \|\| baseResumeUrl`. Step 3 used to flip on application count (the variable was even misnamed `totalMatches`) — now uses real `prisma.jobMatch.count()`. Step 4 ("Apply") now requires a status that's actually past `interested`/`draft`. Step 5 ("Interview") fires on any application reaching the interview stage OR having an `interviewDate` set. The dashboard hero stats also got renamed from the bogus `totalMatches` to `totalApplications` / `jobMatchCount` so the labels match the data. | ✅ |
| 4.3 | Onboarding UX polish | [components/onboarding-steps.tsx](components/onboarding-steps.tsx) now has a top progress bar (animated `.6s`), refreshed step pills using the new tokens (done = mint check, active = saturated indigo with shadow), and a celebratory "You're all set" block when every step is complete — replaces the step list so the finished onboarding doesn't keep nagging the user. Done-step titles dim so the eye lands on what's still actionable. | ✅ |

**Done criteria:** ✅ `tsc --noEmit` clean. Bell either shows a count badge or "all caught up" — never a dead placeholder. Onboarding step completion reflects reality, and the dashboard celebrates when finished instead of permanently displaying "1/5", "2/5"... 

---

## Slice 5 — Production Readiness

Done after all UI slices so the cleanup reflects the final state, not the in-flight one.

| # | Item | Notes | Status |
|---|---|---|---|
| 5.1 | Security review | **XSS:** [components/prep-html-viewer.tsx](components/prep-html-viewer.tsx) rewritten to render n8n-generated HTML inside a `<iframe sandbox="">` so any reflected script can't reach the parent DOM. **Headers:** [next.config.mjs](next.config.mjs) now serves `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` that disables camera/mic/geolocation. **Auth:** every API route auth'd via `requireAuth()`; client never sends `user_id`. **Validation:** zod schemas on every POST body, then `sanitizeString()` escapes any string fields. | ✅ |
| 5.2 | Dead code purge | Deleted: `components/application-board.tsx`, `components/application-card.tsx`, `components/job-match-filters.tsx`, `components/sidebar.tsx`, `components/ui/gooey-input.tsx`, `components/ui/gooey-select.tsx`, `components/ui/interactive-hover-button.tsx`, the unused `ApplicationActions` export inside `application-actions.tsx`, six stale HTML/JSON mockups in `components/` + project root, and the accidental `nul` file. CSS: dropped `.app-row`, `.app-checkbox`, `.app-progress`, `.app-info`, `.app-title`, `.app-company`, the entire Kanban (`.kanban`, `.column*`, `.app-card*`), `.empty-state*`, and `.panel*` blocks from globals.css. | ✅ |
| 5.3 | Refactor messy areas | Tightened error handling across `app/api/*`: replaced `error: any` with `error: unknown` + type-narrowing, removed `as Record<string, unknown>` casts in n8n-client (the typed params were unnecessary), and rewrote the broken `where.application` Prisma query in `app/api/interviews/route.ts` (Interview has no relation back to Application in schema; now fans out via `findMany({ where: { userId } })` and an `applicationId: { in: [...] }` filter). Cleaned `lib/validation.ts` to type the reduce properly. | ✅ |
| 5.4 | Error handling at boundaries | Standardized response shape: every API route returns `{ error: string, details?: string }`. Migrated the follow-up route from its bespoke `{ errorMessage }` (and updated `components/followup-card.tsx` to match). Removed the operational `hint: 'Check Vercel logs for [n8n] prefix…'` leak from response bodies. | ✅ |
| 5.5 | Performance review | Already-good: every page is RSC by default; `Promise.all` for parallel DB; `revalidate` set per page; tight `select` clauses; Neon pooling documented; debounced search; brand loader during transitions. Documented in `PERFORMANCE.md` what we deliberately didn't do (Edge runtime, Redis, Prisma Accelerate) and why. | ✅ |
| 5.6 | Responsive review | Fixed `.shell` mobile `padding-bottom: 160px` → `40px` (was a leftover from the pre-Slice-1 footer). Added mobile breakpoint for `.page-head` so the title and CTAs stack instead of fighting for space. Re-checked all flex/grid wrap behavior. | ✅ |
| 5.7 | Rewrite README.md | Full rewrite: tech stack table, quick-start, full setup, env var matrix, project tree reflecting the current file layout, feature list, Vercel deployment with the explicit "local-disk uploads don't work on serverless" warning, dev-workflow scripts, security overview, troubleshooting matrix. | ✅ |
| 5.8 | Update / prune supporting docs | `SECURITY.md` rewritten to describe the current posture (Clerk + zod + iframe sandbox + headers) instead of the original aspirational checklist; outstanding hardening listed honestly. `PERFORMANCE.md` trimmed to what's actually in place + a "where to look first" table. `DESIGN_HANDOFF.md` **deleted** — it documented the pre-Slice-1 peach/oklch palette which no longer exists. | ✅ |

**Done criteria:** ✅ `tsc --noEmit` clean. Dead code purged. Every route returns a consistent error shape. Security headers + iframe sandbox land the prep viewer in a safe place. README walks a fresh dev to a running app and warns about the production storage gap. SECURITY/PERFORMANCE/REFACTOR_PLAN all describe the **current** state of the code.

---

## Out of scope (deferred)

- Dark mode (variables exist but app is light-only — leave alone unless requested).
- New features outside the request (e.g. follow-up creation from PHASES.md Phase 5).
- Database migrations.

---

## Status legend

| Symbol | Meaning |
|---|---|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Done |
| ⏸ | Paused / blocked |
