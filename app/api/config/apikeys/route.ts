import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!
if (!convexUrl) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL')
}

const convex = new ConvexHttpClient(convexUrl)

// Simple encryption for demo (in production, use proper encryption)
function encryptApiKey(apiKey: string): string {
  return Buffer.from(apiKey).toString('base64')
}

function decryptApiKey(encryptedApiKey: string): string {
  return Buffer.from(encryptedApiKey, 'base64').toString()
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current user
    const user = await convex.query(api.authQueries.getCurrentUser, { token })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    // Get user API keys
    const apiKeys = await convex.query(api.config.getUserApiKeys, {
      userId: user.id,
      providerId: providerId as any
    })

    // Don't return encrypted keys in list
    const safeKeys = apiKeys.map(key => ({
      id: key._id,
      keyName: key.keyName,
      providerId: key.providerId,
      isActive: key.isActive,
      lastUsed: key.lastUsed,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt
    }))

    return NextResponse.json({ apiKeys: safeKeys })
  } catch (error: any) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get API keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current user
    const user = await convex.query(api.authQueries.getCurrentUser, { token })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { providerId, apiKey, keyName } = body

    if (!providerId || !apiKey || !keyName) {
      return NextResponse.json(
        { error: 'Missing required fields: providerId, apiKey, keyName' },
        { status: 400 }
      )
    }

    // Encrypt API key
    const encryptedApiKey = encryptApiKey(apiKey)

    // Add/update API key
    await convex.mutation(api.config.upsertApiKey, {
      userId: user.id,
      providerId,
      encryptedApiKey,
      keyName
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Add API key error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add API key' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current user
    const user = await convex.query(api.authQueries.getCurrentUser, { token })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json(
        { error: 'Missing keyId parameter' },
        { status: 400 }
      )
    }

    // Delete API key
    await convex.mutation(api.config.deleteApiKey, {
      keyId: keyId as any,
      userId: user.id
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete API key error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete API key' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current user
    const user = await convex.query(api.authQueries.getCurrentUser, { token })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { keyId, isActive } = body

    if (!keyId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: keyId, isActive' },
        { status: 400 }
      )
    }

    // Toggle API key status
    await convex.mutation(api.config.toggleApiKeyStatus, {
      keyId: keyId as any,
      userId: user.id,
      isActive
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Toggle API key error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle API key status' },
      { status: 500 }
    )
  }
}
