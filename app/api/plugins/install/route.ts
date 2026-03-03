import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session';
import { NATIVE_PLUGINS } from '@/lib/plugins/catalog';

/**
 * In-memory plugin install store.
 * TODO: replace with Convex table `installedPlugins` for persistence.
 */
const installedStore = new Map<string, Set<string>>();
const configStore   = new Map<string, Record<string, string>>();

async function requireAddress(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.address ?? null;
}

/**
 * POST /api/plugins/install
 * Body: { pluginKey: string, config: Record<string,string>, secrets: Record<string,string> }
 */
export async function POST(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    pluginKey?: string;
    config?: Record<string, string>;
    secrets?: Record<string, string>;
  };

  const { pluginKey, config = {}, secrets = {} } = body;

  if (!pluginKey) {
    return NextResponse.json({ error: 'Missing pluginKey' }, { status: 400 });
  }

  const pluginExists = NATIVE_PLUGINS.some(p => p.key === pluginKey);
  if (!pluginExists) {
    return NextResponse.json({ error: `Unknown plugin: ${pluginKey}` }, { status: 404 });
  }

  // Track installed
  const userPlugins = installedStore.get(address) ?? new Set<string>();
  userPlugins.add(pluginKey);
  installedStore.set(address, userPlugins);

  // Persist config (public fields only — secrets should be encrypted in production)
  // TODO: encrypt secrets with KMS / Vercel env secrets before storing
  const storeKey = `${address}:${pluginKey}`;
  configStore.set(storeKey, { ...config, ...secrets });

  console.info(`[Plugins] Installed '${pluginKey}' for ${address.slice(0, 8)}...`);

  return NextResponse.json({ ok: true, pluginKey, installedAt: Date.now() });
}

/**
 * GET /api/plugins/install
 * Returns list of installed plugin keys for the current user.
 */
export async function GET(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userPlugins = installedStore.get(address) ?? new Set<string>();
  return NextResponse.json({ installed: [...userPlugins] });
}

/**
 * DELETE /api/plugins/install
 * Body: { pluginKey: string }
 */
export async function DELETE(req: NextRequest) {
  const address = await requireAddress(req);
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pluginKey } = await req.json() as { pluginKey?: string };
  if (!pluginKey) return NextResponse.json({ error: 'Missing pluginKey' }, { status: 400 });

  const userPlugins = installedStore.get(address);
  userPlugins?.delete(pluginKey);
  configStore.delete(`${address}:${pluginKey}`);

  return NextResponse.json({ ok: true, pluginKey });
}
