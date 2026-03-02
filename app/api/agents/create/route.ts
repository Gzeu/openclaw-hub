import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export async function POST(request: NextRequest) {
  try {
    const { name, skills, model, description } = await request.json()

    // Validate required fields
    if (!name || !skills || skills.length === 0 || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: name, skills, model' },
        { status: 400 }
      )
    }

    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Check if user is authenticated
    const userResponse = await fetch(`http://localhost:3000/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    const userData = await userResponse.json()
    
    if (!userData.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Get user wallet address or use guest fallback
    const owner = userData.user.walletAddress || 'guest-user'

    // Initialize Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

    // Create agent via Convex mutation
    const result = await convex.mutation(api.agents.createAgent, {
      name: name.trim(),
      skills,
      model,
      description: description?.trim() || undefined,
      owner
    })

    return NextResponse.json({
      success: true,
      agentId: result.agentId,
      sessionKey: result.sessionKey
    })

  } catch (error: any) {
    console.error('Create agent error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    )
  }
}
