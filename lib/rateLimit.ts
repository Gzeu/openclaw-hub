/**
 * Rate limiting via Upstash Redis sliding window.
 * Falls back to allowing all requests if UPSTASH_REDIS_REST_URL is not set.
 *
 * Usage:
 *   const { success, limit, remaining } = await rateLimit(apiKey);
 *   if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 */

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // unix ms
}

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 60; // 60 req/min per apiKey

export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // No Redis configured — allow everything (dev / cold start)
  if (!url || !token) {
    return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1, reset: Date.now() + WINDOW_SECONDS * 1000 };
  }

  const key = `rl:${identifier}`;
  const now = Date.now();
  const windowStart = now - WINDOW_SECONDS * 1000;

  // Sliding window via sorted set
  const pipeline = [
    ['ZREMRANGEBYSCORE', key, '-inf', windowStart],
    ['ZADD', key, now, `${now}-${Math.random()}`],
    ['ZCARD', key],
    ['EXPIRE', key, WINDOW_SECONDS],
  ];

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline),
    });
    if (!res.ok) throw new Error('Redis error');
    const data = await res.json() as Array<{ result: number }>;
    const count = data[2]?.result ?? 0;
    return {
      success: count <= MAX_REQUESTS,
      limit: MAX_REQUESTS,
      remaining: Math.max(0, MAX_REQUESTS - count),
      reset: now + WINDOW_SECONDS * 1000,
    };
  } catch {
    // Fail open on Redis error
    return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_SECONDS * 1000 };
  }
}
