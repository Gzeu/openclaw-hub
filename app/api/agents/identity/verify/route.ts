// app/api/agents/identity/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  verifyIdentitySignature,
  verifyAddressOnChain,
  buildIdentityMessage,
  IdentityProof,
} from '@/lib/agent-identity'

export const dynamic = 'force-dynamic'

const NETWORK =
  (process.env.NEXT_PUBLIC_MVX_NETWORK as 'mainnet' | 'devnet') ?? 'devnet'

/**
 * POST /api/agents/identity/verify
 *
 * Body: { address, agentId, signature, timestamp }
 *
 * Verifică semnătura Ed25519 a agentului folosind:
 *   - cheie publică extrasă din adresa erd1... (bech32 → 32 bytes)
 *   - `crypto.verify()` nativ Node.js — zero dependențe externe
 *   - suport dual: raw signing (agent-to-agent) și MVX wallet prefix (xPortal)
 *
 * Răspuns 200: { verified: true, agentId, did, ... }
 * Răspuns 400: paramă lipsă
 * Răspuns 401: semnătură invalidă
 * Răspuns 422: adresă invalidă / not on-chain (mainnet)
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { address, agentId, signature, timestamp } = body ?? {}

  if (!address || !agentId || !signature || !timestamp) {
    return NextResponse.json(
      {
        error: 'Required: address, agentId, signature, timestamp',
        hint: 'signature = hex Ed25519 signature (128 hex chars = 64 bytes)',
      },
      { status: 400 }
    )
  }

  // Validare format erd1
  if (!address.startsWith('erd1') || address.length < 60) {
    return NextResponse.json(
      { error: 'Invalid address format. Expected erd1... bech32 address.' },
      { status: 400 }
    )
  }

  // Validare format signature
  if (typeof signature !== 'string' || signature.length !== 128 || !/^[0-9a-fA-F]+$/.test(signature)) {
    return NextResponse.json(
      { error: 'Invalid signature format. Expected 128 hex chars (64-byte Ed25519 signature).' },
      { status: 400 }
    )
  }

  // Construiește mesajul canonical (identic cu cel generat la POST /api/agents/identity)
  const canonicalMessage = buildIdentityMessage(agentId, Number(timestamp))

  const proof: IdentityProof = {
    address,
    message: canonicalMessage,
    signature: signature.toLowerCase(),
    timestamp: Number(timestamp),
  }

  // ── Verificare criptografică (Ed25519 nativ Node.js)
  const cryptoValid = verifyIdentitySignature(proof)

  if (!cryptoValid) {
    // Pe mainnet respingem direct
    if (NETWORK === 'mainnet') {
      return NextResponse.json(
        {
          verified: false,
          error: 'Signature verification failed.',
          hint: 'Ensure you signed exactly: ' + canonicalMessage,
        },
        { status: 401 }
      )
    }
    // Pe devnet: warn dar continuă cu on-chain fallback
    const onChain = await verifyAddressOnChain(address, NETWORK)
    if (!onChain.exists) {
      return NextResponse.json(
        { verified: false, error: 'Signature invalid and address not found on devnet.' },
        { status: 401 }
      )
    }
    // Devnet: accept cu avertisment dacă adresa există on-chain
    return NextResponse.json({
      verified: true,
      agentId,
      address,
      did: `did:mvx:${NETWORK}:${address}`,
      canonicalMessage,
      verifiedAt: Date.now(),
      network: NETWORK,
      warning: 'Signature not cryptographically verified (devnet mode). Use mainnet for production.',
      nextStep: 'POST /api/agents/identity/mint pentru a emite NFT de identitate',
    })
  }

  // ✔ Semnătură validă cryptografic
  return NextResponse.json({
    verified: true,
    agentId,
    address,
    did: `did:mvx:${NETWORK}:${address}`,
    canonicalMessage,
    verifiedAt: Date.now(),
    network: NETWORK,
    cryptoVerified: true,
    nextStep: 'POST /api/agents/identity/mint pentru a emite NFT de identitate',
  })
}
