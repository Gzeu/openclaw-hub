import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session';

/**
 * Simple in-memory profile store.
 * TODO: replace with Convex mutation/query or a KV store for persistence.
 */
const profileStore = new Map<string, Record<string, unknown>>();

async function requireAddress(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.address ?? null;
}

/**
 * GET /api/profile
 * Returns the current user's profile merged with wallet address.
 */
export async function GET(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stored = profileStore.get(address) ?? {};
  return NextResponse.json({
    walletAddress: address,
    theme: 'dark',
    language: 'en',
    defaultAgent: 'main',
    notifications: { email: false, push: true, taskUpdates: true },
    ...stored,
  });
}

/**
 * PATCH /api/profile
 * Merges partial updates into the user's profile.
 */
export async function PATCH(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;

  // Prevent overwriting wallet address
  const { walletAddress: _wa, ...updates } = body;

  const existing = profileStore.get(address) ?? {};
  profileStore.set(address, { ...existing, ...updates });

  return NextResponse.json({ ok: true });
}
