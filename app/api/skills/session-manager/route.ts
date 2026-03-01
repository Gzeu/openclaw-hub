import { NextRequest, NextResponse } from 'next/server'
import { sessionManager } from '@/lib/session-manager'

export const runtime = 'nodejs'

// Get session lock status and manage sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'
    const sessionKey = searchParams.get('sessionKey')

    switch (action) {
      case 'status':
        // Get all stuck locks
        const stuckLocks = await sessionManager.getStuckLocks()
        return NextResponse.json({
          success: true,
          action: 'status',
          stuckLocks,
          total: stuckLocks.length,
          message: stuckLocks.length > 0 
            ? `Found ${stuckLocks.length} stuck session locks` 
            : 'No stuck session locks found',
          timestamp: new Date().toISOString()
        })

      case 'check':
        // Check if specific session is locked
        if (!sessionKey) {
          return NextResponse.json({
            success: false,
            error: 'sessionKey is required for check action'
          }, { status: 400 })
        }
        
        const isLocked = await sessionManager.isSessionLocked(sessionKey)
        return NextResponse.json({
          success: true,
          action: 'check',
          sessionKey,
          isLocked,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Use: status, check`
        }, { status: 400 })
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Manage sessions (unlock, cleanup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionKey, maxAgeMinutes = 5, maxAgeHours = 24 } = body

    switch (action) {
      case 'auto-unlock':
        // Auto-unlock all stuck sessions
        const unlockResult = await sessionManager.autoUnlockStuckSessions(maxAgeMinutes)
        return NextResponse.json({
          success: true,
          action: 'auto-unlock',
          ...unlockResult,
          message: `Auto-unlocked ${unlockResult.unlocked} sessions`,
          timestamp: new Date().toISOString()
        })

      case 'force-unlock':
        // Force unlock specific session
        if (!sessionKey) {
          return NextResponse.json({
            success: false,
            error: 'sessionKey is required for force-unlock action'
          }, { status: 400 })
        }
        
        const forceResult = await sessionManager.forceUnlockSession(sessionKey)
        return NextResponse.json({
          success: forceResult.success,
          action: 'force-unlock',
          sessionKey,
          error: forceResult.error,
          message: forceResult.success 
            ? `Force unlocked session: ${sessionKey}`
            : `Failed to unlock session: ${sessionKey}`,
          timestamp: new Date().toISOString()
        })

      case 'cleanup':
        // Clean up old lock files
        const cleanupResult = await sessionManager.cleanupOldLocks(maxAgeHours)
        return NextResponse.json({
          success: true,
          action: 'cleanup',
          ...cleanupResult,
          message: `Cleaned up ${cleanupResult.cleaned} old lock files`,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Use: auto-unlock, force-unlock, cleanup`
        }, { status: 400 })
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
