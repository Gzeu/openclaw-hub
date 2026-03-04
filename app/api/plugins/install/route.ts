import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session';
import { NATIVE_PLUGINS } from '@/lib/plugins/catalog';

// In-memory plugin store — TODO: replace with Convex installedPlugins table
const installedStore = new Map<string, Set<string>>();
const configStore   = new Map<string, Record<string, string>>();

async function requireAddress(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.address ?? null;
}

/** POST /api/plugins/install — install a plugin */
export async function POST(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pluginKey, config = {}, secrets = {} } = await req.json() as {
    pluginKey?: string;
    config?: Record<string, string>;
    secrets?: Record<string, string>;
  };

  if (!pluginKey) return NextResponse.json({ error: 'Missing pluginKey' }, { status: 400 });
  if (!NATIVE_PLUGINS.some(p => p.key === pluginKey))
    return NextResponse.json({ error: `Unknown plugin: ${pluginKey}` }, { status: 404 });

  const userPlugins = installedStore.get(address) ?? new Set<string>();
  userPlugins.add(pluginKey);
  installedStore.set(address, userPlugins);
  configStore.set(`${address}:${pluginKey}`, { ...config, ...secrets });

  return NextResponse.json({ ok: true, pluginKey, installedAt: Date.now() });
}

/** GET /api/plugins/install — list installed plugins */
export async function GET(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ installed: [...(installedStore.get(address) ?? [])] });
}

/** DELETE /api/plugins/install — uninstall a plugin */
export async function DELETE(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { pluginKey } = await req.json() as { pluginKey?: string };
  if (!pluginKey) return NextResponse.json({ error: 'Missing pluginKey' }, { status: 400 });
  installedStore.get(address)?.delete(pluginKey);
  configStore.delete(`${address}:${pluginKey}`);
  return NextResponse.json({ ok: true, pluginKey });
}
