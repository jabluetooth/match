# Security

Current security posture and known gaps. Mirrors what's actually in the code as of the Slice 5 production-readiness pass.

## Authentication & Authorization

- **Clerk** wraps the application (`ClerkProvider` in [app/layout.tsx](app/layout.tsx)).
- **Middleware** at [middleware.ts](middleware.ts) protects every route except `/sign-in`, `/sign-up`, and `/api/webhooks/*`.
- API routes call `requireAuth()` from [lib/auth.ts](lib/auth.ts) at the top of every handler. The client **never** sends a `user_id` — the userId is always derived from the Clerk session server-side. Two routes previously trusted client-supplied user_ids ([`/api/resume/upload`](app/api/resume/upload/route.ts), [`/api/profile/update`](app/api/profile/update/route.ts)); both have been closed.
- Resource-bound routes additionally call `verifyOwnership()` before performing mutations.
- First-time visitors are synced into the `users` table via `requireUserWithSync()`.

## Input Validation

All `POST` bodies are parsed through zod schemas in [lib/validation.ts](lib/validation.ts):

- `InterviewPrepSchema`, `FollowUpResponseSchema`, `ApplicationTrackerSchema`, `CompanyResearchSchema`, `TailorResumeSchema`, `MatchJobsSchema`.
- `validateAndSanitize()` HTML-escapes every string field after parsing to prevent reflected XSS once the data is later interpolated by n8n / LLM output.
- The `/api/profile/update` route has its own inline schema that also enforces `min_salary ≤ max_salary` and caps array lengths.

## XSS / HTML Injection

- `dangerouslySetInnerHTML` is used exactly once, in [components/prep-html-viewer.tsx](components/prep-html-viewer.tsx) — but it's rendered inside a `<iframe sandbox="">` with a fresh document, so any injected content can't reach the parent DOM, run scripts, or read cookies.
- React's default JSX escaping handles all other user-controllable text.

## Security Headers

Set globally via [next.config.mjs](next.config.mjs):

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-DNS-Prefetch-Control` | `on` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

## File Uploads

- Auth required (Clerk).
- Resume bytes are stored as Postgres BYTEA on `user_profiles.base_resume_data` — never written to the filesystem, so there's no public URL and no path-traversal surface. Reads go through [app/api/resume/file/route.ts](app/api/resume/file/route.ts), which streams the row only to its owning Clerk user.
- n8n fetches the same bytes via [app/api/internal/resume/[userId]/route.ts](app/api/internal/resume/[userId]/route.ts), gated by a shared `x-webhook-secret` header (`N8N_WEBHOOK_SECRET`).
- MIME-type whitelist on upload: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- 5 MB cap. Filename is sanitized server-side; client-supplied filenames are never trusted.

## Database

- All Prisma queries are parameterized (no raw SQL strings constructed from user input).
- User IDs are `VARCHAR(255)` to hold Clerk IDs.
- Cascade deletes are configured on user → applications → events / follow-ups so account deletion cleans up cleanly.

## Outstanding hardening

| Item | Notes |
|---|---|
| Rate limiting | None today. Consider Upstash Redis or Vercel Edge Config. n8n triggers are particularly worth limiting (e.g. `match-job`, `tailor-resume`). |
| CSRF protection | Clerk session cookies are `SameSite=Lax` by default which mitigates most CSRF, but for state-changing fetches from third-party origins consider explicit CSRF tokens. |
| Content-Security-Policy | Header isn't set yet. Need to enumerate allowed script/style/font sources first (Next inline styles, Clerk's CDN, Google Fonts). |
| Database RLS | A prepared but inactive `prisma/rls-policies.sql` exists. Enabling requires setting `app.current_user_id` via Prisma middleware on every query. |
| Audit logging | Status changes are logged to `application_events`, but profile edits / resume uploads / etc. are not. |
| 2FA | Clerk supports it; not enforced via dashboard yet. |

## Testing

### Verify auth

```bash
# No session — should return 401
curl -X POST http://localhost:3000/api/match/jobs \
  -H "Content-Type: application/json" -d '{}'
```

### Verify cross-tenant access

1. Create application as user A.
2. Sign in as user B.
3. Hit `/api/track/application` with `action: 'update_status'` and user A's `application_id` — should return `403 Forbidden`.

## Reporting

Email security concerns privately rather than opening a public issue.
