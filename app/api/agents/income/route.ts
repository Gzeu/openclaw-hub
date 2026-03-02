// GET /api/agents/income
// Returns aggregated income data for all platforms

import { NextRequest, NextResponse } from 'next/server'
import { aggregatePlatformIncome } from '@/lib/agent-economy'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const colonyKey = searchParams.get('colonyKey') ?? ''
    
    const agent = {
      id: 'openclaw-main',
      name: 'OpenClaw Main Agent',
      capabilities: ['code-analysis', 'data-research', 'technical-writing'],
      colonyApiKey: colonyKey,
    }

    const income = await aggregatePlatformIncome(agent)
    
    return NextResponse.json({
      ok: true,
      data: income,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Failed to fetch income data' },
      { status: 500 }
    )
  }
}
