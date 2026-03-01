import { NextResponse } from 'next/server'
import { getAllSessions } from '@/lib/openclaw-gateway'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const startTime = Date.now()
    const sessions = getAllSessions()
    
    // System information
    const systemInfo = {
      platform: process.platform,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
    
    // OpenClaw Hub status
    const hubStatus = {
      status: 'healthy',
      version: '0.3.0',
      uptime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      sessions: {
        total: sessions.size,
        active: Array.from(sessions.keys()),
        totalMessages: Array.from(sessions.values()).reduce((total, session) => total + session.length, 0)
      },
      features: {
        embeddedAgents: true,
        sessionPersistence: true,
        dashboardAnalytics: true,
        skillManagement: true,
        realTimeChat: true
      },
      endpoints: {
        chat: '/api/agents/chat',
        agents: '/api/agents',
        skills: '/api/skills',
        dashboard: '/api/dashboard/*',
        health: '/api/health',
        endpoints: '/api/endpoints',
        settings: '/api/settings'
      }
    }
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      system: systemInfo,
      hub: hubStatus
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
