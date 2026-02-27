/**
 * Next.js Middleware — API Route Protection
 * Protects /api/agents/* routes with a shared CRON_SECRET or API key
 *
 * TODO: Replace with full NextAuth.js session check once auth is wired up.
 * For now, accepts either:
 *   - Header: x-cron-secret = CRON_SECRET (for internal/cron calls)
 *   - Header: x-api-key = AGENTS_API_KEY (for external agent calls)
 */
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_PATHS = [
  '/api/agents/status',   // public — health check
  '/api/agents/webhook',  // public — TheColony inbound webhook (has its own HMAC validation)
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /api/agents/* routes
  if (!pathname.startsWith('/api/agents/')) {
    return NextResponse.next();
  }

  // Allow public endpoints through
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const cronSecret = process.env.CRON_SECRET;
  const agentsApiKey = process.env.AGENTS_API_KEY;

  const providedCronSecret = request.headers.get('x-cron-secret');
  const providedApiKey = request.headers.get('x-api-key');

  const validCron = cronSecret && providedCronSecret === cronSecret;
  const validApiKey = agentsApiKey && providedApiKey === agentsApiKey;

  if (!validCron && !validApiKey) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing or invalid authentication credentials' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/agents/:path*'],
};
