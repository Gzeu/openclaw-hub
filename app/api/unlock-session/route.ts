import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/openclaw-gateway'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { sessionKey } = await request.json()
    
    if (!sessionKey) {
      return NextResponse.json({ 
        error: 'sessionKey is required' 
      }, { status: 400 })
    }
    
    // Clear session and remove lock files
    clearSession(sessionKey)
    
    return NextResponse.json({ 
      success: true,
      message: `Session ${sessionKey} unlocked successfully`,
      sessionKey
    })
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message,
      success: false
    }, { status: 500 })
  }
}
