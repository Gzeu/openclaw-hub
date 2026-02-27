/**
 * GET  /api/memory?agentId=&query=&type=&limit=
 * POST /api/memory  { agentId, content, type, importance, tags }
 * DELETE /api/memory/expired
 */
import { NextRequest, NextResponse } from 'next/server';
import { saveMemory, searchMemory, getRecentMemories, buildContextWindow, getMemoryStats, deleteExpiredMemories, MemoryType } from '@/lib/agent-memory';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });

  const query = searchParams.get('query');
  const type = searchParams.get('type') as MemoryType | null;
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const mode = searchParams.get('mode');

  if (mode === 'stats') {
    return NextResponse.json(await getMemoryStats(agentId));
  }
  if (mode === 'context' && query) {
    const ctx = await buildContextWindow(agentId, query);
    return NextResponse.json({ context: ctx });
  }
  if (query) {
    const results = await searchMemory(agentId, query, { type: type ?? undefined, limit });
    return NextResponse.json({ results });
  }
  const memories = await getRecentMemories(agentId, type ?? undefined, limit);
  return NextResponse.json({ memories });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agentId, content, type = 'episodic', importance, tags, ttlHours } = body;
  if (!agentId || !content) return NextResponse.json({ error: 'Missing agentId or content' }, { status: 400 });
  const id = await saveMemory(agentId, content, type, { importance, tags, ttlHours });
  return NextResponse.json({ success: true, id });
}

export async function DELETE() {
  const count = await deleteExpiredMemories();
  return NextResponse.json({ deleted: count });
}
