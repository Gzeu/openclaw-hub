// Agent-to-Agent delegation endpoint
// Agent A calls this to delegate a task to Agent B
import { NextRequest, NextResponse } from 'next/server'
import { sendToAgent } from '@/lib/openclaw-gateway'
import { runInSandbox } from '@/lib/e2b'

export const runtime = 'nodejs'
export const maxDuration = 120

export interface DelegateRequest {
  fromAgent: string      // session key of calling agent
  toAgent: string        // session key of target agent
  task: string           // natural language task
  code?: string          // optional code to run in E2B sandbox first
  language?: 'python' | 'javascript'
}

export async function POST(req: NextRequest) {
  try {
    const body: DelegateRequest = await req.json()
    const { fromAgent, toAgent, task, code, language } = body

    if (!fromAgent || !toAgent || !task) {
      return NextResponse.json(
        { error: 'fromAgent, toAgent, and task are required' },
        { status: 400 }
      )
    }

    let sandboxResult = null

    // Step 1: Run code in E2B sandbox if provided
    if (code && process.env.E2B_API_KEY) {
      console.log(`[Delegate] ${fromAgent} -> E2B sandbox`)
      sandboxResult = await runInSandbox(code, language ?? 'python')
    }

    // Step 2: Build enriched task prompt with sandbox output
    const enrichedTask = sandboxResult
      ? `${task}\n\nContext from code execution:\nSTDOUT: ${sandboxResult.stdout}\nSTDERR: ${sandboxResult.stderr}`
      : task

    // Step 3: Delegate to target agent via OpenClaw Gateway
    console.log(`[Delegate] ${fromAgent} -> ${toAgent}: ${task.slice(0, 80)}...`)
    const stream = await sendToAgent(toAgent, enrichedTask)

    const reader = stream.getReader()
    const chunks: string[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(new TextDecoder().decode(value))
    }

    return NextResponse.json({
      fromAgent,
      toAgent,
      task,
      sandboxResult,
      response: chunks.join(''),
      delegatedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[Delegate] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
