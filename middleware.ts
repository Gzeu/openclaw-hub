/**
 * Next.js Middleware — API Route Protection + WorkOS AuthKit
 *
 * Protects /api/agents/* routes. Accepts:
 *   - Header x-cron-secret = CRON_SECRET  (internal / cron calls)
 *   - Header x-api-key     = AGENTS_API_KEY (external agent calls)
 *   - WorkOS AuthKit session cookies (authenticated users)
 *
 * When env vars are not configured, routes are left open in development
 * and return a clear 503 "not configured" response in production —
 * never a crash / white page.
 */
import { NextRequest, NextResponse } from 'next/server';
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

const PUBLIC_AGENT_PATHS = [
  '/api/agents/status',
  '/api/agents/webhook',
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate /api/agents/* routes
  if (!pathname.startsWith('/api/agents/')) {
    return NextResponse.next();
  }

  // Always allow public endpoints through
  if (PUBLIC_AGENT_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const cronSecret   = process.env.CRON_SECRET   ?? '';
  const agentsApiKey = process.env.AGENTS_API_KEY ?? '';
  const isDev        = process.env.NODE_ENV === 'development';

  // Check for API key authentication first (for external calls)
  const providedCron   = request.headers.get('x-cron-secret')  ?? '';
  const providedApiKey = request.headers.get('x-api-key')      ?? '';

  const validCron   = cronSecret   && providedCron   === cronSecret;
  const validApiKey = agentsApiKey && providedApiKey === agentsApiKey;

  // If valid API key authentication, allow through
  if (validCron || validApiKey) {
    return NextResponse.next();
  }

  // In development, allow all requests without authentication
  if (isDev) {
    return NextResponse.next();
  }

  // If neither secret is configured and not in dev:
  if (!cronSecret && !agentsApiKey) {
    return NextResponse.json(
      {
        error: 'Not configured',
        message:
          'Agent API keys are not set. Add CRON_SECRET and/or AGENTS_API_KEY to your environment variables.',
        docs: 'https://github.com/Gzeu/openclaw-hub#environment-variables',
      },
      { status: 503 }
    );
  }

  // If WorkOS environment variables are configured, use WorkOS AuthKit
  if (process.env.WORKOS_CLIENT_ID && process.env.WORKOS_API_KEY) {
    const authMiddleware = authkitMiddleware({
      debug: process.env.NODE_ENV === 'development',
    });
    return authMiddleware(request);
  }

  // Fallback: unauthorized
  return NextResponse.json(
    {
      error: 'Unauthorized',
      message: 'Missing or invalid authentication credentials.',
      hint: isDev
        ? 'In dev, set CRON_SECRET or AGENTS_API_KEY in .env.local and pass them via x-cron-secret / x-api-key headers.'
        : 'Check your API key.',
    },
    { status: 401 }
  );
}

export const config = {
  matcher: ['/api/agents/:path*'],
};
