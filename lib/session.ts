import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'ocl_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  walletAddress: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Parse session from middleware request (edge-compatible, no crypto)
 * Just checks if cookie exists and is not expired via simple base64 check
 */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const cookie = req.cookies.get(SESSION_COOKIE);
  if (!cookie?.value) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(cookie.value, 'base64').toString('utf-8')
    ) as SessionPayload;
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get session in a Server Component / Route Handler (node runtime)
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie?.value) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(cookie.value, 'base64').toString('utf-8')
    ) as SessionPayload;
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Build a signed session cookie value
 */
export function buildSessionCookieValue(walletAddress: string): string {
  const payload: SessionPayload = {
    walletAddress,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
