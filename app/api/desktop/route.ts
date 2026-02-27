import { NextRequest, NextResponse } from 'next/server'
import { createDesktopSandbox, runDesktopCommand, takeScreenshot } from '@/lib/e2b-desktop'
import { addActivity } from '@/lib/activity-log'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { action, sandboxId, command, agentId } = await req.json()

    if (!process.env.E2B_API_KEY) {
      return NextResponse.json({ error: 'E2B_API_KEY not configured' }, { status: 500 })
    }

    if (action === 'create') {
      const session = await createDesktopSandbox(agentId ?? 'unknown')
      addActivity({
        type: 'desktop_action',
        agentId,
        summary: `Desktop sandbox created: ${session.sandboxId}`,
        status: 'success',
        meta: session,
      })
      return NextResponse.json(session)
    }

    if (action === 'command' && sandboxId && command) {
      const start = Date.now()
      const result = await runDesktopCommand(sandboxId, command)
      addActivity({
        type: 'desktop_action',
        agentId,
        summary: `Desktop cmd: ${command.slice(0, 60)}`,
        durationMs: Date.now() - start,
        status: 'success',
        meta: { sandboxId },
      })
      return NextResponse.json(result)
    }

    if (action === 'screenshot' && sandboxId) {
      const screenshot = await takeScreenshot(sandboxId)
      return NextResponse.json({ sandboxId, screenshotBase64: screenshot })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
