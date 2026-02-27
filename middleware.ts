/**
 * Next.js Middleware — API Route Protection
 *
 * Protects /api/agents/* routes. Accepts:
 *   - Header x-cron-secret = CRON_SECRET  (internal / cron calls)
 *   - Header x-api-key     = AGENTS_API_KEY (external agent calls)
 *
 * When env vars are not configured, routes are left open in development
 * and return a clear 503 "not configured" response in production —
 * never a crash / white page.
 *
 * TODO: Replace with NextAuth.js session check once auth is wired up.
 */
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_AGENT_PATHS = [
  '/api/agents/status',
  '/api/agents/webhook',
];

export function middleware(request: NextRequest) {
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

  // If neither secret is configured:
  //   • Development — let the request through so developers can test without config
  //   • Production  — return 503 instead of crashing or silently returning 401
  if (!cronSecret && !agentsApiKey) {
    if (isDev) {
      return NextResponse.next();
    }
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

  const providedCron   = request.headers.get('x-cron-secret')  ?? '';
  const providedApiKey = request.headers.get('x-api-key')      ?? '';

  const validCron   = cronSecret   && providedCron   === cronSecret;
  const validApiKey = agentsApiKey && providedApiKey === agentsApiKey;

  if (!validCron && !validApiKey) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/agents/:path*'],
};
