import { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'ocl_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface Session {
  walletAddress: string;
  connectedAt: number;
  expiresAt: number;
}

export function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString('base64url');
}

export function decodeSession(token: string): Session | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
    if (!decoded.walletAddress || !decoded.expiresAt) return null;
    if (Date.now() > decoded.expiresAt) return null;
    return decoded as Session;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): Session | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function getSessionFromCookies(): Promise<Session | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}
