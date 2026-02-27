import { NextRequest, NextResponse } from 'next/server'
import { runInSandbox } from '@/lib/e2b'
import { addActivity } from '@/lib/activity-log'

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

    const start = Date.now()
    const result = await runInSandbox(code, language)

    addActivity({
      type: 'sandbox_run',
      agentId,
      summary: `Ran ${language} code — ${result.executionTime}ms`,
      durationMs: Date.now() - start,
      status: result.error ? 'error' : 'success',
      meta: { sandboxId: result.sandboxId, language },
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
