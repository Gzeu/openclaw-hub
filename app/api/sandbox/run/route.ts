import { NextRequest, NextResponse } from 'next/server'
import { runInSandbox } from '@/lib/e2b'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { code, language = 'python', agentId } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'code is required' }, { status: 400 })
    }
    if (!process.env.E2B_API_KEY) {
      return NextResponse.json({ error: 'E2B_API_KEY not configured' }, { status: 500 })
    }

    console.log(`[E2B] Running code for agent ${agentId ?? 'unknown'}`)
    const result = await runInSandbox(code, language)

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[E2B] sandbox error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
