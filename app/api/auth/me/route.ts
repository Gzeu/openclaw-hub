import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    address: session.address,
  });
}
