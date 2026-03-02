import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { NATIVE_PLUGINS } from '@/lib/plugins/catalog';
import { fetchRegistrySkills, searchRegistrySkills } from '@/lib/plugins/registry';

// GET /api/plugins?type=native|registry&q=search&category=ai
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? 'native';
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';

  if (type === 'registry') {
    const skills = q
      ? await searchRegistrySkills(q)
      : await fetchRegistrySkills();
    return NextResponse.json({ skills });
  }

  // Native plugins
  let plugins = NATIVE_PLUGINS;
  if (category) plugins = plugins.filter(p => p.category === category);
  if (q) {
    const lq = q.toLowerCase();
    plugins = plugins.filter(
      p =>
        p.name.toLowerCase().includes(lq) ||
        p.description.toLowerCase().includes(lq) ||
        p.capabilities.some(c => c.toLowerCase().includes(lq))
    );
  }
  return NextResponse.json({ plugins });
}
