import { NextResponse } from 'next/server'
import { getSessionHistory } from '@/lib/openclaw-gateway'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: { sessionKey: string } }
) {
  try {
    const { sessionKey } = params
    const history = getSessionHistory(sessionKey)
    
    return NextResponse.json({ 
      sessionKey,
      history,
      messageCount: history.length
    })
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message,
      history: []
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { sessionKey: string } }
) {
  try {
    const { sessionKey } = params
    const { clearSession } = await import('@/lib/openclaw-gateway')
    clearSession(sessionKey)
    
    return NextResponse.json({ 
      sessionKey,
      cleared: true,
      message: 'Session cleared successfully'
    })
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message
    }, { status: 500 })
  }
}
