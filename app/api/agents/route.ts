import { NextResponse } from 'next/server'
import { listSessions } from '@/lib/openclaw-gateway'
import { fetchRegisteredAgents } from '@/lib/multiversx'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Merge OpenClaw gateway sessions + MultiversX registry
    const [sessions, registrations] = await Promise.allSettled([
      listSessions(),
      fetchRegisteredAgents(),
    ])

    const gwSessions = sessions.status === 'fulfilled' ? sessions.value : []
    const mvxAgents = registrations.status === 'fulfilled' ? registrations.value : []

    // Merge by agentId / sessionKey
    const agents = gwSessions.map((session) => {
      const mvx = mvxAgents.find((a) => a.agentId === session.key)
      return {
        ...session,
        address: mvx?.address ?? null,
        capabilities: mvx?.capabilities ?? [],
        pricePerTask: mvx?.pricePerTask ?? null,
        online: true,
      }
    })

    // Add MVX-registered agents not yet connected to Gateway
    for (const mvx of mvxAgents) {
      if (!agents.find((a) => a.key === mvx.agentId)) {
        agents.push({
          key: mvx.agentId,
          label: mvx.agentId,
          address: mvx.address,
          capabilities: mvx.capabilities,
          pricePerTask: mvx.pricePerTask,
          online: false,
        })
      }
    }

    return NextResponse.json({ agents })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
