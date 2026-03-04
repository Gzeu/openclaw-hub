import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

/**
 * POST /api/auth/logout
 * Clears the mx_session cookie.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
