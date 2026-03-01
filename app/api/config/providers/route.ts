import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!
if (!convexUrl) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL')
}

const convex = new ConvexHttpClient(convexUrl)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeParam = searchParams.get('type')
    const isActiveParam = searchParams.get('isActive')

    // Convert params to proper types
    const type = typeParam as any || undefined
    const isActive = isActiveParam ? isActiveParam === 'true' : undefined

    // Get AI providers
    const providers = await convex.query(api.config.getAIProviders, {
      type,
      isActive
    })

    return NextResponse.json({ providers })
  } catch (error: any) {
    console.error('Get providers error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get providers' },
      { status: 500 }
    )
  }
}
