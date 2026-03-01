import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!
if (!convexUrl) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL')
}

const convex = new ConvexHttpClient(convexUrl)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const agentId = searchParams.get('agentId') || undefined
    const type = searchParams.get('type') || undefined

    // Get activities from Convex
    const activities = await convex.query(api.agentComms.getAgentActivities, {
      agentId,
      type: type as any,
      limit,
    })

    // Transform to match activity page format
    const transformedActivities = activities.map(activity => ({
      id: activity._id.toString(),
      type: activity.type,
      agentId: activity.agentId,
      summary: activity.summary,
      meta: activity.meta,
      durationMs: activity.durationMs,
      status: activity.status,
      createdAt: new Date(activity.createdAt).toISOString(),
    }))

    return NextResponse.json({ activity: transformedActivities })
  } catch (error: any) {
    console.error('Activity API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // For now, we'll keep the old in-memory clear
    // In production, we might want to add a delete mutation to Convex
    const { clearActivity } = await import('@/lib/activity-log')
    clearActivity()
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Clear activity error:', error)
    return NextResponse.json(
      { error: 'Failed to clear activities', details: error.message },
      { status: 500 }
    )
  }
}
