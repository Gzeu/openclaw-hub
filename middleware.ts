import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

/**
 * OpenClaw Hub — Edge Middleware
 *
 * Auth strategy:
 * 1. Public routes (/api/auth/*, /api/skills, /api/health, skill.md, etc.) — no auth
 * 2. Any /api/* request with x-api-key header — M2M auth, bypass cookie check
 *    (rate limiting + audit log happen inside the route handler)
 * 3. Protected pages (agents, economy, chat, etc.) — require session cookie
 * 4. Any /api/* without x-api-key — require session cookie
 */

const PUBLIC_API_PREFIXES = [
  '/api/auth/',
  '/api/skills',
  '/api/health',
  '/api/mcp',
  '/.well-known',
  '/skill.md',
];

const PROTECTED_PAGES = [
  '/agents',
  '/economy',
  '/settings',
  '/wallet',
  '/activity',
  '/analyst',
  '/chat',
];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Always allow public API routes + static assets
  if (
    PUBLIC_API_PREFIXES.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    /\.(?:ico|png|svg|jpg|jpeg|webp|woff2?|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. M2M: x-api-key header → allow through, tag for downstream handlers
  const apiKey = req.headers.get('x-api-key');
  if (apiKey && pathname.startsWith('/api/')) {
    const res = NextResponse.next();
    res.headers.set('x-openclaw-auth', 'apikey');
    return res;
  }

  // 3. Protected pages require session cookie
  if (PROTECTED_PAGES.some(p => pathname.startsWith(p))) {
    const session = getSessionFromRequest(req);
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Protected API routes (no x-api-key) require session cookie
  if (pathname.startsWith('/api/')) {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: provide session cookie or x-api-key header' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.png$|.*\.svg$|.*\.ico$).*)'],
};
