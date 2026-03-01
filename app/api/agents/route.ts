import { NextResponse } from 'next/server'
import { listSessions, checkGatewayStatus, getAllAgents } from '@/lib/openclaw-gateway'
import { fetchRegisteredAgents } from '@/lib/multiversx'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Check if Gateway is running
    const gatewayOnline = await checkGatewayStatus()
    
    if (!gatewayOnline) {
      return NextResponse.json({ 
        agents: [],
        gatewayOnline: false,
        error: 'Gateway is not running'
      })
    }
    
    // Get all available agents from OpenClaw
    const openclawAgents = await getAllAgents()
    
    // Get registered agents from MultiversX
    const registrations = await fetchRegisteredAgents()
    
    // Merge OpenClaw agents with MultiversX registry
    const agents = openclawAgents.map((agent) => {
      const mvx = registrations.find((a) => a.agentId === agent.id)
      return {
        key: agent.sessionKey,
        label: `${agent.name} (${agent.id})`,
        agentId: agent.id,
        address: mvx?.address ?? null,
        capabilities: mvx?.capabilities ?? ['chat', 'web', 'data-analysis'],
        pricePerTask: mvx?.pricePerTask ?? 0.001,
        online: true,
        sessionKey: agent.sessionKey
      }
    })

    return NextResponse.json({ 
      agents,
      gatewayOnline: true,
      totalAgents: agents.length
    })
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message,
      gatewayOnline: false,
      agents: []
    }, { status: 500 })
  }
}
