import { NextResponse } from 'next/server'
import { listSessions, checkGatewayStatus, getAllAgents } from '@/lib/openclaw-gateway'
import { fetchRegisteredAgents } from '@/lib/multiversx'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

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
    
    // Get agents from Convex database
    let convexAgents: any[] = []
    try {
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
      convexAgents = await convex.query(api.agents.getActiveAgents)
    } catch (error) {
      console.log('Convex agents not available:', error)
    }
    
    // Merge OpenClaw agents with MultiversX registry and Convex agents
    const agents = [
      // OpenClaw agents
      ...openclawAgents.map((agent) => {
        const mvx = registrations.find((a) => a.agentId === agent.id)
        return {
          key: agent.sessionKey,
          label: `${agent.name} (${agent.id})`,
          agentId: agent.id,
          address: mvx?.address ?? null,
          capabilities: mvx?.capabilities ?? ['chat', 'web', 'data-analysis'],
          pricePerTask: mvx?.pricePerTask ?? 0.001,
          online: true,
          sessionKey: agent.sessionKey,
          source: 'openclaw'
        }
      }),
      // Convex agents
      ...convexAgents.map((agent) => ({
        key: agent.sessionKey || agent._id.toString(),
        label: agent.name,
        agentId: agent._id.toString(),
        address: agent.walletAddress,
        capabilities: agent.capabilities,
        pricePerTask: null,
        online: true,
        sessionKey: agent.sessionKey,
        source: 'convex',
        preferredModel: agent.preferredModel,
        description: agent.description,
        createdAt: agent.createdAt
      }))
    ]

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
