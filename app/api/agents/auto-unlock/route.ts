import { NextRequest, NextResponse } from 'next/server'
import { clearSession } from '@/lib/openclaw-gateway'

export const runtime = 'nodejs'

// Auto-unlock sessions when they get stuck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionKey, force = false } = body

    if (!sessionKey) {
      return NextResponse.json({
        success: false,
        error: 'sessionKey is required'
      }, { status: 400 })
    }

    // Clear session and remove lock files
    clearSession(sessionKey)

    return NextResponse.json({
      success: true,
      message: `Session ${sessionKey} auto-unlocked successfully`,
      sessionKey,
      action: 'auto_unlock',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Check for locked sessions and auto-unlock them
export async function GET() {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const sessionDir = 'C:\\Users\\el\\.openclaw\\agents\\default\\sessions'
    const lockedSessions: any[] = []
    
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir)
      files.forEach((file: string) => {
        if (file.endsWith('.lock')) {
          const lockPath = path.join(sessionDir, file)
          try {
            const stats = fs.statSync(lockPath)
            const lockAge = Date.now() - stats.mtime.getTime()
            
            // If lock is older than 5 minutes, it's probably stuck
            if (lockAge > 5 * 60 * 1000) {
              lockedSessions.push({
                file,
                path: lockPath,
                ageMs: lockAge,
                ageMinutes: Math.round(lockAge / 60000)
              })
            }
          } catch (error) {
            console.log(`Could not check lock file: ${lockPath}`)
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      lockedSessions,
      total: lockedSessions.length,
      message: lockedSessions.length > 0 
        ? `Found ${lockedSessions.length} stuck session locks` 
        : 'No stuck session locks found',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
