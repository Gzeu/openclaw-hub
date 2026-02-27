// POST /api/agents/loop
// Triggers the autonomous agent loop for a given agent identity
// Called by cron (every 15 min) or manually from the dashboard

import { NextRequest, NextResponse } from 'next/server'
import {
  type AgentIdentity,
  runAutonomousAgentLoop,
  aggregatePlatformIncome,
  colonyRegisterAgent,
} from '@/lib/agent-economy'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, agent } = body as {
      action: 'run' | 'register' | 'income'
      agent: AgentIdentity
    }

    if (!agent?.id) {
      return NextResponse.json({ error: 'Missing agent.id' }, { status: 400 })
    }

    if (action === 'register') {
      const result = await colonyRegisterAgent(agent)
      return NextResponse.json({ ok: !!result, data: result })
    }

    if (action === 'income') {
      const income = await aggregatePlatformIncome(agent)
      return NextResponse.json({ ok: true, data: income })
    }

    // Default: run autonomous loop
    const result = await runAutonomousAgentLoop(agent)
    return NextResponse.json({ ok: result.status === 'success', data: result })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Internal error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    info: 'OpenClaw Agent Economy Loop',
    endpoints: {
      'POST /api/agents/loop': {
        actions: ['run', 'register', 'income'],
        body: '{ action: string, agent: AgentIdentity }',
      },
    },
    platforms: ['thecolony', 'moltverr', 'opentask', 'ugig'],
    description:
      'Autonomous agent loop — scans platforms for tasks, executes in E2B, delivers, earns karma/sats/USDC',
  })
}
