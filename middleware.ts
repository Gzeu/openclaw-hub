import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

/** Public routes that never require a wallet session */
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/mx/verify',
  '/api/auth/logout',
  '/api/agents/status',
  '/api/agents/webhook',
  '/_next',
  '/favicon',
  '/public',
];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check wallet session
  const session = getSessionFromRequest(req);
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Agent API protection (requires x-api-key on top of session)
  if (pathname.startsWith('/api/agents/')) {
    const agentsApiKey = process.env.AGENTS_API_KEY ?? '';
    const providedKey = req.headers.get('x-api-key') ?? '';
    if (agentsApiKey && providedKey !== agentsApiKey && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
