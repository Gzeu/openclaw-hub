import { NextRequest, NextResponse } from 'next/server'
import { analyzeCSV } from '@/lib/ai-analyst'
import { addActivity } from '@/lib/activity-log'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const prompt = (formData.get('prompt') as string) || 'Give me a full analysis'
    const agentId = (formData.get('agentId') as string) || undefined

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }
    if (!process.env.E2B_API_KEY) {
      return NextResponse.json({ error: 'E2B_API_KEY not configured' }, { status: 500 })
    }

    const csvContent = await file.text()
    const start = Date.now()

    addActivity({
      type: 'file_upload',
      agentId,
      summary: `Analyzing ${file.name} (${Math.round(file.size / 1024)}KB)`,
      status: 'running',
    })

    const result = await analyzeCSV(csvContent, file.name, prompt, agentId)

    addActivity({
      type: 'sandbox_run',
      agentId,
      summary: `AI analysis of ${file.name} — ${result.charts.length} charts generated`,
      durationMs: Date.now() - start,
      status: result.error ? 'error' : 'success',
      meta: { charts: result.charts.length, sandboxId: result.sandboxId },
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
