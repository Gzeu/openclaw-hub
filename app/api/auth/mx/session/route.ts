import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { getSessionFromRequest } from '@/lib/session'

export const dynamic = 'force-dynamic'

const ACCEPTED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://openclaw-hub-ashen.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
]

/**
 * GET /api/auth/mx/session
 * Returns the current session address from cookie.
 */
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ error: 'No active session' }, { status: 401 })
  }
  return NextResponse.json({ address: session.address })
}

/**
 * POST /api/auth/mx/session
 * Body: { accessToken: string } — MultiversX NativeAuth token
 *
 * Validates token → upserts user in Convex → returns { ok, mxAddress, apiKey }.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { accessToken } = body as { accessToken?: string }
    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 })
    }

    // Validate MultiversX NativeAuth token
    const { NativeAuthServer } = await import('@multiversx/sdk-native-auth-server')
    const server = new NativeAuthServer({
      apiUrl: 'https://api.multiversx.com',
      maxExpirySeconds: 86400,
      acceptedOrigins: ACCEPTED_ORIGINS,
    })

    const userInfo = await server.validate(accessToken)
    const mxAddress: string = userInfo.address
    if (!mxAddress?.startsWith('erd1')) {
      return NextResponse.json({ error: 'Invalid MultiversX address' }, { status: 401 })
    }

    // Generate a candidate apiKey (used only if user is new)
    const candidateKey = 'sk-oc-' + crypto.randomUUID().replace(/-/g, '').slice(0, 16)

    // Upsert in Convex — returns canonical apiKey (existing or new)
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    let apiKey = candidateKey
    if (convexUrl) {
      const client = new ConvexHttpClient(convexUrl)
      const result = await client.mutation(api.mxUsers.upsertMxUser, {
        mxAddress,
        apiKey: candidateKey,
      })
      apiKey = result.apiKey
    }

    return NextResponse.json(
      { ok: true, mxAddress, apiKey },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (err: unknown) {
    console.error('[Auth/MX/Session]', err)
    const message = err instanceof Error ? err.message : 'Session creation failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  })
}
