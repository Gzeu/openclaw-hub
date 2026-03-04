import { NextResponse } from 'next/server'
import { listSessions, checkGatewayStatus, getAllAgents } from '@/lib/openclaw-gateway'
import { fetchRegisteredAgents } from '@/lib/multiversx'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export const runtime = 'nodejs'

export async function GET() {
  // Always load Convex agents first — independent of gateway
  let convexAgents: any[] = []
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    convexAgents = await convex.query(api.agents.getActiveAgents)
  } catch (err) {
    console.log('Convex agents not available:', err)
  }

  // Check gateway (OpenClaw local service — may be offline)
  const gatewayOnline = await checkGatewayStatus()

  let openclawAgents: any[] = []
  let registrations: any[] = []

  if (gatewayOnline) {
    try {
      openclawAgents = await getAllAgents()
    } catch (err) {
      console.log('OpenClaw agents error:', err)
    }
    try {
      registrations = await fetchRegisteredAgents()
    } catch (err) {
      console.log('MvX registry error:', err)
    }
  }

  const agents = [
    // OpenClaw gateway agents (only when gateway is online)
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
        source: 'openclaw',
      }
    }),
    // Convex custom agents — always included
    ...convexAgents.map((agent) => ({
      key: agent.sessionKey || agent._id.toString(),
      label: agent.name,
      agentId: agent._id.toString(),
      address: agent.walletAddress ?? null,
      capabilities: agent.capabilities ?? ['chat'],
      pricePerTask: null,
      online: true,
      sessionKey: agent.sessionKey,
      source: 'convex',
      preferredModel: agent.preferredModel,
      description: agent.description,
      createdAt: agent.createdAt,
    })),
  ]

  return NextResponse.json({
    agents,
    gatewayOnline,
    totalAgents: agents.length,
  })
}
