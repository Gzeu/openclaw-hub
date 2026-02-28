// app/api/agents/identity/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAddressOnChain, buildIdentityMessage } from '@/lib/agent-identity'

export const dynamic = 'force-dynamic'

const NETWORK =
  (process.env.NEXT_PUBLIC_MVX_NETWORK as 'mainnet' | 'devnet') ?? 'devnet'

/**
 * POST /api/agents/identity/verify
 * Body: { address, agentId, signature, timestamp }
 *
 * Verifică că semnătura Ed25519 este validă pentru mesajul canonical.
 * Devnet: placeholder (verifică doar că adresa există on-chain).
 * Producție: integrezi @multiversx/sdk-wallet → UserVerifier.fromAddress().verify()
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { address, agentId, signature, timestamp } = body ?? {}

  if (!address || !agentId || !signature || !timestamp) {
    return NextResponse.json(
      { error: 'Required: address, agentId, signature, timestamp' },
      { status: 400 }
    )
  }

  const onChain = await verifyAddressOnChain(address, NETWORK)

  // ─── Producție ────────────────────────────────────────────────────────────
  // import { Address } from '@multiversx/sdk-core'
  // import { UserVerifier } from '@multiversx/sdk-wallet'
  // const msg = buildIdentityMessage(agentId, timestamp)
  // const verifier = UserVerifier.fromAddress(Address.fromBech32(address))
  // const valid = verifier.verify(
  //   Buffer.from(msg),
  //   Buffer.from(signature, 'hex')
  // )
  // ─────────────────────────────────────────────────────────────────────────

  const valid = onChain.exists // devnet placeholder

  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Generează mesaj pentru audit log
  const canonicalMessage = buildIdentityMessage(agentId, timestamp)

  return NextResponse.json({
    verified: true,
    agentId,
    address,
    did: `did:mvx:${NETWORK}:${address}`,
    canonicalMessage,
    verifiedAt: Date.now(),
    network: NETWORK,
    nextStep: 'POST /api/agents/identity/mint pentru a emite NFT de identitate',
  })
}
