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
| 3.1 | Redesign status card | Find which file ("status card") refers to — likely `application-card.tsx` or the row in `app/applications/page.tsx`. Reduce clutter, lead with company + title + status pill + primary action. | ⬜ |
| 3.2 | Funnel snapshot rework | `application-funnel.tsx` — add dividers between stages, group stages (Applied / Interviewing / Decided), tighten spacing, add subtle stage transitions (chevrons or progress bar) instead of just stacked rows. | ⬜ |
| 3.3 | Remove redundant UI | Audit for duplicate buttons, dead actions, info shown twice. Cross-reference `ApplicationActions` vs `ApplicationRowActions`. | ⬜ |
| 3.4 | Apply modern SaaS dashboard patterns | Filters as segmented control, bulk actions on row select, density toggle if useful. Don't add filters that aren't backed by data. | ⬜ |

**Done criteria:** Application page reads at a glance. Funnel snapshot has clear visual grouping. No dead buttons.

---

## Slice 4 — Header + Getting Started Polish

| # | Item | Notes | Status |
|---|---|---|---|
| 4.1 | Decide notification bell fate | Either: (a) remove it entirely; (b) wire it to a real source (recent activities? unread followups?). I'll propose option for confirmation before implementing. | ⬜ |
| 4.2 | Fix Getting Started step actions | `onboarding-steps.tsx` derives `status` from data passed in; verify each `step.href` actually does what the step says (resume upload, generate matches, apply, etc.) and that the "done" detection matches reality. | ⬜ |
| 4.3 | Improve onboarding empty state | First-run user should see encouragement, not zeros. Add a "Skip for now" affordance. | ⬜ |

**Done criteria:** Bell is either gone or meaningful. Every onboarding action navigates somewhere useful and updates state on completion.

---

## Slice 5 — Production Readiness

Done after all UI slices so the cleanup reflects the final state, not the in-flight one.

| # | Item | Notes | Status |
|---|---|---|---|
| 5.1 | Security review | Re-read `SECURITY.md` + run a focused pass: secrets in env, Clerk auth on every API route, Prisma input validation (zod), n8n webhook auth, no `dangerouslySetInnerHTML` without sanitization (`prep-html-viewer.tsx` is a hot spot). | ⬜ |
| 5.2 | Dead code / dup logic | Remove unused files in `components/`, unused exports, duplicate components. Cross-reference imports. | ⬜ |
| 5.3 | Refactor messy areas | Specifically: settings-form (after rebuild), application page (after rebuild), n8n-client wrappers, any `any`-typed responses. | ⬜ |
| 5.4 | Error handling at boundaries | Every API route returns typed JSON errors; client surfaces them via toast; never silent failures. | ⬜ |
| 5.5 | Performance pass | Check bundle size, RSC vs client split, identify any client components that should be RSC, lazy-load heavy chart components. | ⬜ |
| 5.6 | Responsive review | Open every page at 375 / 768 / 1280 / 1920. Fix breaks. | ⬜ |
| 5.7 | Rewrite README.md | Setup, env vars (point to `.env.example`), deployment (Vercel + Neon), structure, features, troubleshooting, dev workflow, security. | ⬜ |
| 5.8 | Update `PERFORMANCE.md` / `SECURITY.md` / `DESIGN_HANDOFF.md` | Or delete if obsolete. | ⬜ |

**Done criteria:** `next build` clean. No `alert()`, no `console.log` outside dev paths, no unused exports, README walks a fresh dev to a running app.

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
