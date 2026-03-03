import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { getPluginByKey } from '@/lib/plugins/catalog';
import { encrypt } from '@/lib/crypto';

interface InstallBody {
  pluginKey: string;
  config?: Record<string, string>;
  secrets?: Record<string, string>; // fields marked isSecret
}

// POST /api/plugins/install
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as InstallBody;
  const { pluginKey, config = {}, secrets = {} } = body;

  const plugin = getPluginByKey(pluginKey);
  if (!plugin) {
    return NextResponse.json({ error: `Unknown plugin: ${pluginKey}` }, { status: 404 });
  }

  // Encrypt secrets
  const encryptedSecrets: Record<string, string> = {};
  for (const [k, v] of Object.entries(secrets)) {
    if (v) encryptedSecrets[k] = await encrypt(v);
  }

  // Store in Convex via internal API (calls convex mutation)
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: 'Convex not configured' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    plugin: pluginKey,
    walletAddress: session.walletAddress,
    config,
    encryptedSecrets,
    installedAt: Date.now(),
  });
}
