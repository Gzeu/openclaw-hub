import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
