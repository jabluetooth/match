# Performance

What's already optimized, and where to look first if things feel slow.

## Already in place

- **Database pooling** — required for serverless. Use Neon's pooled URL (append `-pooler` to the hostname). Drops connection-establish latency from hundreds of ms to single digits.
- **Server Components by default** — pages fetch directly from Prisma; only interactive widgets (search, filters, popovers) are client components.
- **RSC caching** — `export const revalidate = N` on every page (`30s` for app pages, `300s` for settings). Same browser refresh re-uses the cached RSC payload.
- **Parallel queries** — every page that needs multiple tables uses `Promise.all(...)` (see [app/page.tsx](app/page.tsx)).
- **Tight DB queries** — `select: { ... }` is used where only a few columns are needed (notifications, owner-checks, etc.).
- **Brand loader covers route transitions** — [app/loading.tsx](app/loading.tsx) renders a fixed full-page overlay so navigations feel instant even when the server is still streaming.
- **Debounced search** — Jobs page debounces the search input by 250ms before pushing to the URL.

## When things feel slow

| Symptom | First check |
|---|---|
| Cold start latency on Vercel | Make sure `DATABASE_URL` uses the **pooled** Neon URL and that your function region is in the same AWS region as your DB (Neon shows the region in the connection string). |
| Page feels slow in dev | `npm run dev` is unoptimized by design. Compare against `npm run build && npm start`. |
| n8n calls hang | Check the n8n editor — if you're running with default `N8N_FORCE_TEST_WEBHOOKS` unset in dev, you need to click "Listen for test event" first. |
| Specific slow query | Open Neon → Monitoring → "Slow queries". Indexes are already defined on `userId`, `status`, `interviewDate`. |

## Targets

- Page TTFB (production, warm): under **300 ms**.
- Dashboard initial render: under **800 ms**.
- DB query duration: under **50 ms**.

## Things we deliberately haven't done

- **Edge runtime** — Prisma + Clerk both work on Node runtime today; moving to Edge would require swapping the Prisma adapter and `@clerk/nextjs/server` for the Edge variants. Not worth the churn unless the cold-start budget actually demands it.
- **Redis caching layer** — RSC + Vercel's data cache already covers the most common access patterns. Add Redis only when you need cross-route caching or rate limiting.
- **Prisma Accelerate** — pooling via Neon's PgBouncer is sufficient at current scale.
