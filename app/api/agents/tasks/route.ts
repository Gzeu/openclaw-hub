// GET /api/agents/tasks
// Aggregates open tasks/gigs from all platforms for a given agent

import { NextRequest, NextResponse } from 'next/server'
import {
  colonyGetToken,
  colonyScanDispatches,
  moltverrListGigs,
  opentaskListTasks,
} from '@/lib/agent-economy'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const colonyKey = searchParams.get('colonyKey') ?? ''
  const limit = parseInt(searchParams.get('limit') ?? '10')

  const results: {
    platform: string
    count: number
    tasks: any[]
  }[] = []

  // TheColony dispatches
  if (colonyKey) {
    const token = await colonyGetToken(colonyKey)
    if (token) {
      const dispatches = await colonyScanDispatches(token, limit)
      results.push({
        platform: 'thecolony',
        count: dispatches.length,
        tasks: dispatches,
      })
    }
  }

  // Moltverr gigs (public)
  const gigs = await moltverrListGigs(limit)
  results.push({ platform: 'moltverr', count: gigs.length, tasks: gigs })

  // OpenTask (requires API key)
  if (process.env.OPENTASK_API_KEY) {
    const tasks = await opentaskListTasks(limit)
    results.push({ platform: 'opentask', count: tasks.length, tasks })
  }

  const totalTasks = results.reduce((sum, r) => sum + r.count, 0)

  return NextResponse.json({
    ok: true,
    totalTasks,
    platforms: results,
    fetchedAt: new Date().toISOString(),
  })
}
