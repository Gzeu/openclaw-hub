import { clearSession } from './openclaw-gateway'

export interface SessionLockInfo {
  file: string
  path: string
  ageMs: number
  ageMinutes: number
  pid?: string
}

export class SessionManager {
  private static instance: SessionManager
  private sessionDir = 'C:\\Users\\el\\.openclaw\\agents\\default\\sessions'

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  // Check for stuck session locks
  async getStuckLocks(maxAgeMinutes = 5): Promise<SessionLockInfo[]> {
    const fs = require('fs')
    const path = require('path')
    const stuckLocks: SessionLockInfo[] = []

    try {
      if (fs.existsSync(this.sessionDir)) {
        const files = fs.readdirSync(this.sessionDir)
        
        for (const file of files) {
          if (file.endsWith('.lock')) {
            const lockPath = path.join(this.sessionDir, file)
            try {
              const stats = fs.statSync(lockPath)
              const lockAge = Date.now() - stats.mtime.getTime()
              
              // If lock is older than maxAgeMinutes, it's probably stuck
              if (lockAge > maxAgeMinutes * 60 * 1000) {
                // Extract PID from filename if possible
                const pidMatch = file.match(/pid=(\d+)/)
                const pid = pidMatch ? pidMatch[1] : undefined
                
                stuckLocks.push({
                  file,
                  path: lockPath,
                  ageMs: lockAge,
                  ageMinutes: Math.round(lockAge / 60000),
                  pid
                })
              }
            } catch (error) {
              console.log(`Could not check lock file: ${lockPath}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking session locks:', error)
    }

    return stuckLocks
  }

  // Auto-unlock stuck sessions
  async autoUnlockStuckSessions(maxAgeMinutes = 5): Promise<{ unlocked: number; errors: string[] }> {
    const stuckLocks = await this.getStuckLocks(maxAgeMinutes)
    const errors: string[] = []
    let unlocked = 0

    for (const lock of stuckLocks) {
      try {
        // Extract session key from lock filename
        const sessionKeyMatch = lock.file.match(/([a-f0-9-]+)\.jsonl\.lock$/)
        if (sessionKeyMatch) {
          const sessionId = sessionKeyMatch[1]
          const sessionKey = `agent:default:main` // Default session key
          
          console.log(`Auto-unlocking stuck session: ${lock.file} (${lock.ageMinutes} minutes old)`)
          
          // Clear session and remove lock files
          clearSession(sessionKey)
          unlocked++
        }
      } catch (error) {
        const errorMsg = `Failed to unlock ${lock.file}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return { unlocked, errors }
  }

  // Check if a specific session is locked
  async isSessionLocked(sessionKey: string): Promise<boolean> {
    const fs = require('fs')
    const path = require('path')
    
    try {
      if (fs.existsSync(this.sessionDir)) {
        const files = fs.readdirSync(this.sessionDir)
        return files.some((file: string) => file.endsWith('.lock'))
      }
    } catch (error) {
      console.error('Error checking session lock:', error)
    }
    
    return false
  }

  // Force unlock a specific session
  async forceUnlockSession(sessionKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Force unlocking session: ${sessionKey}`)
      clearSession(sessionKey)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Clean up old lock files
  async cleanupOldLocks(maxAgeHours = 24): Promise<{ cleaned: number; errors: string[] }> {
    const fs = require('fs')
    const path = require('path')
    const errors: string[] = []
    let cleaned = 0

    try {
      if (fs.existsSync(this.sessionDir)) {
        const files = fs.readdirSync(this.sessionDir)
        
        for (const file of files) {
          if (file.endsWith('.lock')) {
            const lockPath = path.join(this.sessionDir, file)
            try {
              const stats = fs.statSync(lockPath)
              const lockAge = Date.now() - stats.mtime.getTime()
              
              // If lock is older than maxAgeHours, delete it
              if (lockAge > maxAgeHours * 60 * 60 * 1000) {
                fs.unlinkSync(lockPath)
                console.log(`Cleaned up old lock file: ${file}`)
                cleaned++
              }
            } catch (error) {
              const errorMsg = `Failed to clean up ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`
              errors.push(errorMsg)
              console.error(errorMsg)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old locks:', error)
    }

    return { cleaned, errors }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()
