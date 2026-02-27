// MCP Bridge — OpenClaw ACP <-> E2B Sandbox
// Exposes E2B sandbox capabilities as MCP tools
// Compatible with e2b-dev/mcp-server protocol
import { NextRequest, NextResponse } from 'next/server'
import { runInSandbox } from '@/lib/e2b'
import { addActivity } from '@/lib/activity-log'

export const runtime = 'nodejs'
export const maxDuration = 60

// MCP tool manifest — returned to any MCP client (OpenClaw, Claude, etc.)
const MCP_TOOLS = [
  {
    name: 'e2b_run_code',
    description: 'Run Python or JavaScript code in a secure E2B sandbox and get stdout/stderr back.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code to execute' },
        language: { type: 'string', enum: ['python', 'javascript'], default: 'python' },
      },
      required: ['code'],
    },
  },
  {
    name: 'e2b_analyze_data',
    description: 'Analyze CSV data using pandas in E2B sandbox. Pass raw CSV as string.',
    inputSchema: {
      type: 'object',
      properties: {
        csv: { type: 'string', description: 'Raw CSV content' },
        question: { type: 'string', description: 'What to analyze' },
      },
      required: ['csv', 'question'],
    },
  },
]

export async function GET() {
  // MCP discovery endpoint
  return NextResponse.json({
    name: 'openclaw-hub-e2b',
    version: '1.0.0',
    description: 'E2B sandbox tools for OpenClaw agents via MCP',
    tools: MCP_TOOLS,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tool, input, agentId } = body

    if (!process.env.E2B_API_KEY) {
      return NextResponse.json({ error: 'E2B_API_KEY not configured' }, { status: 500 })
    }

    const start = Date.now()

    if (tool === 'e2b_run_code') {
      const result = await runInSandbox(input.code, input.language ?? 'python')
      addActivity({
        type: 'mcp_call',
        agentId,
        summary: `MCP e2b_run_code (${input.language ?? 'python'}) — ${result.executionTime}ms`,
        durationMs: Date.now() - start,
        status: result.error ? 'error' : 'success',
        meta: { sandboxId: result.sandboxId },
      })
      return NextResponse.json({ result })
    }

    if (tool === 'e2b_analyze_data') {
      const code = `
import pandas as pd
import io
csv_data = """${input.csv.replace(/"/g, '"""')}"""
df = pd.read_csv(io.StringIO(csv_data))
print(df.describe().to_string())
print()
print('Question: ${input.question}')
print('Shape:', df.shape)
print('Columns:', list(df.columns))
`
      const result = await runInSandbox(code, 'python')
      addActivity({
        type: 'mcp_call',
        agentId,
        summary: `MCP e2b_analyze_data — ${input.question?.slice(0, 50)}`,
        durationMs: Date.now() - start,
        status: result.error ? 'error' : 'success',
      })
      return NextResponse.json({ result })
    }

    return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
