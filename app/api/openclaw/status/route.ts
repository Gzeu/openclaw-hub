import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if OpenClaw connection is available
    // This is a placeholder - in a real implementation, you would check
    // the actual OpenClaw node status or blockchain connection
    
    const isConnected = true // Placeholder - would check actual connection
    
    return NextResponse.json({
      connected: isConnected,
      status: isConnected ? 'online' : 'offline',
      lastChecked: new Date().toISOString(),
      nodeInfo: {
        version: '0.3.0',
        network: 'devnet',
        endpoint: 'https://devnet-api.multiversx.com'
      }
    })
  } catch (error: any) {
    console.error('OpenClaw status check error:', error)
    return NextResponse.json(
      { 
        connected: false, 
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
