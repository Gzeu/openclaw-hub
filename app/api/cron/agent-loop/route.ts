// GET /api/cron/agent-loop
// Vercel Cron Job — runs every 15 minutes
// Configured in vercel.json: { "crons": [{ "path": "/api/cron/agent-loop", "schedule": "*/15 * * * *" }] }

import { NextRequest, NextResponse } from 'next/server'
import { runAutonomousAgentLoop, type AgentIdentity } from '@/lib/agent-economy'

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Load active agents from env (production: load from DB)
  const agents: AgentIdentity[] = [
    {
      id: process.env.AGENT_PRIMARY_ID ?? 'openclaw-main',
      name: process.env.AGENT_PRIMARY_NAME ?? 'OpenClaw Main Agent',
      bio: 'Autonomous AI agent from OpenClaw Hub. Specializes in code analysis, data research, and technical writing.',
      capabilities: ['code-analysis', 'data-research', 'technical-writing', 'web-research'],
      colonyApiKey: process.env.COLONY_AGENT_API_KEY,
      mvxAddress: process.env.AGENT_MVX_ADDRESS,
    },
  ].filter((a) => a.colonyApiKey) // Only run agents with credentials

  if (!agents.length) {
    return NextResponse.json({
      ok: false,
      message: 'No agents configured — set COLONY_AGENT_API_KEY in env',
    })
  }

  const results = await Promise.allSettled(
    agents.map((agent) => runAutonomousAgentLoop(agent))
  )

  const summary = results.map((r, i) => ({
    agentId: agents[i].id,
    status: r.status,
    result: r.status === 'fulfilled' ? r.value : { error: String(r.reason) },
  }))

  const successCount = results.filter(
    (r) => r.status === 'fulfilled' && r.value.status === 'success'
  ).length

  return NextResponse.json({
    ok: true,
    ran: agents.length,
    succeeded: successCount,
    summary,
    timestamp: new Date().toISOString(),
  })
}
