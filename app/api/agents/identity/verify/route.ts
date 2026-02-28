// app/api/agents/identity/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  verifyIdentitySignature,
  verifyAddressOnChain,
  IdentityProof,
} from '@/lib/agent-identity'

export const dynamic = 'force-dynamic'

const NETWORK =
  (process.env.NEXT_PUBLIC_MVX_NETWORK as 'mainnet' | 'devnet') ?? 'devnet'

const PROOF_TTL_MS = 10 * 60 * 1000 // 10 minutes

/**
 * GET /api/agents/identity/verify
 * Usage docs
 */
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/agents/identity/verify',
    description:
      'Verify Ed25519 proof-of-ownership for an OpenClaw agent identity. ' +
      'Supports raw agent signing AND MultiversX wallet prefix (xPortal / web wallet). ' +
      'Zero external dependencies — uses native Node.js crypto.',
    required: ['address', 'message', 'signature', 'timestamp'],
    optional: ['agentId'],
    example: {
      address: 'erd1...',
      agentId: '<uuid from POST /api/agents/identity>',
      message: 'openclaw-identity:<agentId>:<timestamp>',
      signature: '<128-char hex Ed25519 signature>',
      timestamp: 1709123456789,
    },
    notes: [
      'message and timestamp come from POST /api/agents/identity (.proof.messageToSign)',
      'signature must be Ed25519 — 64 bytes = 128 hex characters',
      'Supports raw signing (agent) AND MVX wallet prefix (xPortal / web wallet)',
      `Proof expires after ${PROOF_TTL_MS / 60000} minutes`,
      'On success: verified=true + DID + onChain status + nextStep=mint',
    ],
  })
}

/**
 * POST /api/agents/identity/verify
 * Body: { address, message, signature, timestamp, agentId? }
 *
 * Verifies Ed25519 proof-of-ownership via native Node.js crypto (zero deps).
 * Called after POST /api/agents/identity returns messageToSign.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { address, message, signature, timestamp, agentId } = body

  // ── Validate required fields
  if (
    typeof address !== 'string' ||
    typeof message !== 'string' ||
    typeof signature !== 'string' ||
    (typeof timestamp !== 'number' && typeof timestamp !== 'string')
  ) {
    return NextResponse.json(
      { error: 'Required: address (string), message (string), signature (string), timestamp (number)' },
      { status: 400 }
    )
  }

  // ── Validate signature length (Ed25519 = 64 bytes = 128 hex chars)
  if (signature.length !== 128 || !/^[0-9a-fA-F]+$/.test(signature)) {
    return NextResponse.json(
      { error: 'signature must be a 128-character lowercase hex string (64-byte Ed25519 signature)' },
      { status: 400 }
    )
  }

  // ── Check proof TTL
  const ts = Number(timestamp)
  const ageMs = Date.now() - ts
  if (ageMs > PROOF_TTL_MS) {
    return NextResponse.json(
      {
        error: `Proof expired (${Math.round(ageMs / 60000)} min old, max ${PROOF_TTL_MS / 60000} min). ` +
          'Request a new messageToSign via POST /api/agents/identity.',
      },
      { status: 422 }
    )
  }

  // ── Ed25519 verify (raw + MVX wallet prefix fallback)
  const proof: IdentityProof = {
    address,
    message,
    signature,
    timestamp: ts,
  }

  let valid = false
  let verifyError: string | null = null
  try {
    valid = verifyIdentitySignature(proof)
  } catch (err) {
    verifyError = err instanceof Error ? err.message : 'Unknown error during verification'
  }

  if (!valid) {
    return NextResponse.json(
      {
        verified: false,
        address,
        did: `did:mvx:${NETWORK}:${address}`,
        error: verifyError ?? 'Signature verification failed',
        hint: 'Ensure you signed the exact messageToSign with the wallet whose address matches the erd1 address.',
      },
      { status: 422 }
    )
  }

  // ── On-chain address check (non-blocking)
  const onChain = await verifyAddressOnChain(address, NETWORK).catch(() => ({
    exists: false,
    nonce: 0,
    balance: '0',
  }))

  return NextResponse.json({
    verified: true,
    address,
    did: `did:mvx:${NETWORK}:${address}`,
    network: NETWORK,
    agentId: agentId ?? null,
    onChain,
    proof: {
      message,
      timestamp: ts,
      age: `${Math.round(ageMs / 1000)}s`,
      signaturePrefix: signature.slice(0, 12) + '...',
    },
    meta: {
      nextStep: 'POST /api/agents/identity/mint (coming soon — mint soulbound CLAWID NFT on MVX)',
      note: 'Identity verified. This agent is the cryptographic owner of the address.',
    },
  })
}
