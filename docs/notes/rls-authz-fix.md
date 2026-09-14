# Bug note: dead RLS policies + authz hardening (Match)

**Date solved:** 2026-07-21
**Repo:** `match`
**Commit:** `0d73aef` — fix(security): harden API authz error handling, add rate limiting, fix XSS/RLS gaps

## The bug

Postgres RLS policies existed in `prisma/rls-policies.sql` for every user-scoped
table (`users`, `applications`, `interview_prep`, `tailored_resumes`, etc.),
each keyed off `current_setting('app.current_user_id', TRUE)`. Looked like
defense-in-depth. It wasn't doing anything.

Prisma connects as the table owner. Postgres RLS never applies to the table
owner (or any role with `BYPASSRLS`), regardless of whether the policies are
enabled. Nothing in the app ever ran `SET app.current_user_id` on the
connection either — the session variable the policies checked was never set.
So the policies were dead on two independent counts: even if the setting had
been wired up, the owning role would have sailed past them anyway.

Net effect: every route's real access control was whatever app-layer checks
happened to be in the handler. The SQL file gave false confidence that a
second, DB-level layer existed when it didn't.

## The fix

- Deleted `prisma/rls-policies.sql` and the matching RLS section from
  `prisma/schema-export.sql` — stop presenting a control that isn't active.
- Standardized on app-layer isolation via `lib/auth.ts`: `requireAuth()`
  resolves the Clerk session to a `userId`, and every ownership-sensitive
  route calls `verifyOwnership(resourceUserId)` before touching the row.
- Documented that this *is* the isolation boundary, so it doesn't get
  mistaken for a stopgap again.

Same audit pass fixed adjacent issues in the same commit: timing-safe
comparison on the n8n internal webhook secret (was a plain `!==`), sanitized
error `details` fields that were leaking internal messages to clients across
13 routes, and rate limiting on the routes that trigger n8n workflows.

## Why it matters / how to apply

If you reach for Postgres RLS as a second line of defense, verify the app's
DB role is actually subject to it (`\du` — check for `BYPASSRLS`, and check
whether the ORM connects as the table owner) and that the session variable
the policy checks is actually being set per-request. An RLS policy that never
fires is worse than no policy: it reads as a safety net in a security review
while the real enforcement is silently 100% app-layer.
