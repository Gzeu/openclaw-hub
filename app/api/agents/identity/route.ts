// app/api/agents/identity/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAddressOnChain,
  createIdentityRecord,
  getIdentityNfts,
  buildIdentityMessage,
  AgentIdentity,
} from '@/lib/agent-identity'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

const IDENTITY_COLLECTION =
  process.env.CLAW_IDENTITY_COLLECTION ?? 'CLAWID-000000'
const NETWORK =
  (process.env.NEXT_PUBLIC_MVX_NETWORK as 'mainnet' | 'devnet') ?? 'devnet'

/**
 * GET /api/agents/identity?address=erd1...
 * Returnează status on-chain + NFT-uri de identitate pentru o adresă
 */
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 })
  }

  const [onChain, nfts] = await Promise.all([
    verifyAddressOnChain(address, NETWORK),
    getIdentityNfts(address, IDENTITY_COLLECTION, NETWORK),
  ])

  return NextResponse.json({
    address,
    network: NETWORK,
    onChain,
    identityNfts: nfts,
    hasIdentity: nfts.length > 0,
    did: `did:mvx:${NETWORK}:${address}`,
  })
}

/**
 * POST /api/agents/identity
 * Body: { address, name, description?, skills? }
 * Creează identitate off-chain + returnează mesajul de semnat pentru proof
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.address || !body?.name) {
    return NextResponse.json(
      { error: 'Required: address, name' },
      { status: 400 }
    )
  }

  const { address, name, description = '', skills = [] } = body

  const onChain = await verifyAddressOnChain(address, NETWORK)
  if (!onChain.exists && NETWORK === 'mainnet') {
    return NextResponse.json(
      { error: 'Address not found on-chain' },
      { status: 422 }
    )
  }

  const agentId = randomUUID()
  const identity: AgentIdentity = createIdentityRecord({
    agentId,
    address,
    name,
    description,
    skills,
    network: NETWORK,
  })

  const timestamp = Date.now()
  const messageToSign = buildIdentityMessage(agentId, timestamp)

  return NextResponse.json({
    identity,
    proof: {
      messageToSign,
      timestamp,
      instructions:
        'Semnează messageToSign cu wallet-ul MultiversX și trimite la POST /api/agents/identity/verify',
    },
    meta: {
      nextStep: 'POST /api/agents/identity/verify',
      mintStep: 'POST /api/agents/identity/mint (după verificare)',
    },
  })
}
