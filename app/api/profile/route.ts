import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session';

// In-memory store - TODO: migrate to Convex userSettings table
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
    mxAddress: address, // Matches ProfileData interface in app/profile/page.tsx
    username: address.slice(0, 8),
    budget: 0,
    apiKey: 'sk-oc-' + address.slice(-12), // Placeholder or fetch from Convex
    createdAt: Date.now(),
    theme: 'dark',
    language: 'en',
    defaultAgent: 'main',
    notifications: { email: false, push: true, taskUpdates: true },
    ...stored,
  });
}

/**
 * PATCH /api/profile
 * Updates the current user's profile settings.
 */
export async function PATCH(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const current = profileStore.get(address) ?? {};
    profileStore.set(address, { ...current, ...body });
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}
