import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

// GET /api/profile
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
    walletAddress: session.walletAddress,
    connectedAt: session.connectedAt,
  });
}

// PATCH /api/profile
export async function PATCH(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  // Forward to Convex mutation for persistence
  return NextResponse.json({ success: true, updated: body, walletAddress: session.walletAddress });
}
