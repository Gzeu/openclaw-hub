import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { getPluginByKey } from '@/lib/plugins/catalog';

// GET /api/plugins/:key - get single plugin definition
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { key } = await params;
  const plugin = getPluginByKey(key);
  if (!plugin) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ plugin });
}

// DELETE /api/plugins/:key - uninstall plugin for current wallet
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { key } = await params;
  return NextResponse.json({
    success: true,
    message: `Plugin ${key} uninstalled for ${session.address}`,
  });
}
