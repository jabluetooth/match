import { prisma } from '@/lib/prisma';

/**
 * Simple sliding-window rate limiter backed by the existing `ActivityLog`
 * table (one row per attempt, keyed by userId + action). Used to throttle
 * routes that trigger paid or expensive downstream work (n8n workflows,
 * PDF conversions).
 *
 * Not distributed-lock-safe under heavy concurrent bursts from the same user
 * (a classic count-then-insert race), but that's an acceptable tradeoff here
 * — the goal is throttling accidental/abusive repeat clicks, not enforcing a
 * hard cap under adversarial concurrency.
 */
export class RateLimitError extends Error {
  constructor(action: string) {
    super(`Rate limit exceeded for ${action}`);
    this.name = 'RateLimitError';
  }
}

interface RateLimitOptions {
  /** Sliding window size in milliseconds. */
  windowMs: number;
  /** Max attempts allowed within the window. */
  max: number;
}

/**
 * Throws `RateLimitError` if the user has already made `max` or more calls
 * for `action` within the last `windowMs`. Otherwise records this attempt.
 */
export async function enforceRateLimit(
  userId: string,
  action: string,
  { windowMs, max }: RateLimitOptions,
): Promise<void> {
  const since = new Date(Date.now() - windowMs);

  const count = await prisma.activityLog.count({
    where: { userId, action, createdAt: { gte: since } },
  });

  if (count >= max) {
    throw new RateLimitError(action);
  }

  await prisma.activityLog.create({ data: { userId, action } });
}
