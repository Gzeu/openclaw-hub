import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { getSessionFromRequest } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { name, skills, model, description } = await request.json()

    if (!name || !skills || skills.length === 0 || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: name, skills, model' },
        { status: 400 }
      )
    }

    // Read session cookie directly — no localhost fetch needed
    const session = getSessionFromRequest(request)
    const owner = session?.address ?? 'guest-user'

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

    const result = await convex.mutation(api.agents.createAgent, {
      name: name.trim(),
      skills,
      model,
      description: description?.trim() || undefined,
      owner,
    })

    return NextResponse.json({
      success: true,
      agentId: result.agentId,
      sessionKey: result.sessionKey,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create agent'
    console.error('Create agent error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
