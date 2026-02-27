/**
 * GET  /api/reputation?agentId=           → get single agent reputation
 * GET  /api/reputation?leaderboard=true   → top 20 agents
 * POST /api/reputation  { agentId, type, platform, metadata }
 * POST /api/reputation/endorse  { fromAgentId, toAgentId, reason }
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateReputation,
  recordReputationEvent,
  getLeaderboard,
  endorseAgent,
  formatReputationBadge,
  ReputationEvent,
} from '@/lib/agent-reputation';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const leaderboard = searchParams.get('leaderboard') === 'true';

  if (leaderboard) {
    const agents = await getLeaderboard(20);
    return NextResponse.json({ leaderboard: agents });
  }

  if (!agentId) return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  const rep = await getOrCreateReputation(agentId);
  const badge = formatReputationBadge(rep);
  return NextResponse.json({ reputation: rep, badge });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'endorse') {
    const { fromAgentId, toAgentId, reason } = body;
    if (!fromAgentId || !toAgentId) return NextResponse.json({ error: 'Missing agents' }, { status: 400 });
    await endorseAgent(fromAgentId, toAgentId, reason);
    return NextResponse.json({ success: true });
  }

  const { agentId, type, platform, metadata } = body as {
    agentId: string;
    type: ReputationEvent['type'];
    platform: string;
    metadata?: Record<string, unknown>;
  };
  if (!agentId || !type) return NextResponse.json({ error: 'Missing agentId or type' }, { status: 400 });
  const rep = await recordReputationEvent(agentId, type, platform ?? 'openclaw', metadata);
  return NextResponse.json({ success: true, reputation: rep });
}
