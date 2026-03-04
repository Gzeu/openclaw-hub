import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'mx_session';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'openclaw-hub-dev-secret-change-in-prod'
);

export interface Session {
  address: string;
  iat: number;
  exp: number;
}

export async function createSessionToken(address: string): Promise<string> {
  return new SignJWT({ address })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

/**
 * Lightweight sync decode used in Edge middleware.
 * Does NOT verify signature — verification happens inside API route handlers.
 */
export function getSessionFromRequest(req: NextRequest): { address: string } | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), '=');
    const payload = JSON.parse(atob(b64)) as { address?: string; exp?: number };
    if (!payload.address) return null;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { address: payload.address };
  } catch {
    return null;
  }
}

export function setSessionCookie(
  response: { cookies: { set: (name: string, value: string, opts: object) => void } },
  token: string
) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });
}

export function clearSessionCookie(
  response: { cookies: { delete: (name: string) => void } }
) {
  response.cookies.delete(SESSION_COOKIE_NAME);
}
