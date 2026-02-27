import { NextRequest } from 'next/server'
import { sendToAgent } from '@/lib/openclaw-gateway'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { sessionKey, text } = await req.json()

    if (!sessionKey || !text) {
      return new Response(JSON.stringify({ error: 'sessionKey and text required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Stream the response from OpenClaw Gateway back to the client
    const stream = await sendToAgent(sessionKey, text)
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
