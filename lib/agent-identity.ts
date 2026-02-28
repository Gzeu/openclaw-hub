// lib/agent-identity.ts
import { getMvxApiBase } from './multiversx-client'
import { verify as cryptoVerify, createPublicKey } from 'crypto'

export interface AgentIdentity {
  agentId: string
  address: string
  did: string
  name: string
  description: string
  skills: string[]
  nftNonce?: number
  nftCollection?: string
  createdAt: number
  network: 'mainnet' | 'devnet'
  verified: boolean
}

export interface IdentityProof {
  address: string
  message: string
  signature: string // hex Ed25519 signature (64 bytes)
  timestamp: number
}

// ---------------------------------------------------------------------------
// DID / message helpers
// ---------------------------------------------------------------------------

export function buildAgentDid(
  address: string,
  network: 'mainnet' | 'devnet' = 'mainnet'
): string {
  return `did:mvx:${network}:${address}`
}

export function buildIdentityMessage(agentId: string, timestamp: number): string {
  return `openclaw-identity:${agentId}:${timestamp}`
}

// ---------------------------------------------------------------------------
// Bech32 decoder (MVX erd1... → 32-byte Ed25519 public key)
// Zero external dependencies — pure Node.js
// ---------------------------------------------------------------------------

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

function decodeBech325Bits(dataStr: string): number[] {
  return Array.from(dataStr).map((c) => {
    const idx = BECH32_CHARSET.indexOf(c.toLowerCase())
    if (idx < 0) throw new Error(`Invalid bech32 char: ${c}`)
    return idx
  })
}

function convertBits(data: number[], fromBits: number, toBits: number): number[] {
  let acc = 0
  let bits = 0
  const result: number[] = []
  const maxv = (1 << toBits) - 1
  for (const v of data) {
    acc = (acc << fromBits) | v
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      result.push((acc >> bits) & maxv)
    }
  }
  return result
}

/**
 * Decode an erd1... bech32 address to its raw 32-byte Ed25519 public key.
 * Works with mainnet and devnet (same format).
 */
export function decodeMvxAddress(address: string): Buffer {
  const sep = address.lastIndexOf('1')
  if (sep < 0) throw new Error('Invalid MVX address: no separator')
  const dataStr = address.slice(sep + 1)
  const decoded5 = decodeBech325Bits(dataStr)
  // strip 6-char bech32 checksum
  const payload = decoded5.slice(0, -6)
  const bytes = convertBits(payload, 5, 8)
  if (bytes.length !== 32) throw new Error(`Expected 32 pubkey bytes, got ${bytes.length}`)
  return Buffer.from(bytes)
}

// ---------------------------------------------------------------------------
// Ed25519 verify via Node.js native crypto (zero deps)
// ---------------------------------------------------------------------------

// Ed25519 SubjectPublicKeyInfo (SPKI) DER header — constant for all Ed25519 keys
const ED25519_SPKI_HEADER = Buffer.from('302a300506032b6570032100', 'hex')

function verifyEd25519Raw(
  pubkeyBytes: Buffer,
  messageBuf: Buffer,
  signatureHex: string
): boolean {
  try {
    if (signatureHex.length !== 128) return false // must be 64 bytes
    const spki = Buffer.concat([ED25519_SPKI_HEADER, pubkeyBytes])
    const publicKey = createPublicKey({ key: spki, format: 'der', type: 'spki' })
    const sigBuf = Buffer.from(signatureHex, 'hex')
    return cryptoVerify(null, messageBuf, publicKey, sigBuf)
  } catch {
    return false
  }
}

/**
 * MVX wallet prefix used by xPortal / web wallet when signing arbitrary messages.
 * Format: `\x17MultiversX Signed Message:\n{len}{message}`
 */
function wrapMvxPrefix(message: string): Buffer {
  const msgBuf = Buffer.from(message)
  const prefix = `\x17MultiversX Signed Message:\n${msgBuf.length}`
  return Buffer.concat([Buffer.from(prefix), msgBuf])
}

/**
 * Verify an identity proof signature.
 * Tries raw message first (agent-to-agent programmatic signing),
 * then falls back to MVX wallet prefix (xPortal / web wallet).
 */
export function verifyIdentitySignature(proof: IdentityProof): boolean {
  try {
    const pubkeyBytes = decodeMvxAddress(proof.address)
    // 1. Raw (agent signing)
    if (verifyEd25519Raw(pubkeyBytes, Buffer.from(proof.message), proof.signature)) {
      return true
    }
    // 2. With MVX wallet prefix (xPortal / web wallet signing)
    return verifyEd25519Raw(pubkeyBytes, wrapMvxPrefix(proof.message), proof.signature)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// On-chain lookups
// ---------------------------------------------------------------------------

export async function verifyAddressOnChain(
  address: string,
  network: 'mainnet' | 'devnet' = 'devnet'
): Promise<{ exists: boolean; nonce: number; balance: string }> {
  const base = getMvxApiBase(network)
  try {
    const res = await fetch(`${base}/accounts/${address}`)
    if (!res.ok) return { exists: false, nonce: 0, balance: '0' }
    const data = await res.json()
    return {
      exists: true,
      nonce: data.nonce ?? 0,
      balance: data.balance ?? '0',
    }
  } catch {
    return { exists: false, nonce: 0, balance: '0' }
  }
}

export async function getIdentityNfts(
  address: string,
  collection: string,
  network: 'mainnet' | 'devnet' = 'devnet'
): Promise<{ nonce: number; name: string; metadata: Record<string, unknown> }[]> {
  const base = getMvxApiBase(network)
  try {
    const res = await fetch(
      `${base}/accounts/${address}/nfts?collections=${collection}&size=10`
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map((n: Record<string, unknown>) => ({
      nonce: n.nonce as number,
      name: n.name as string,
      metadata: (n.metadata as Record<string, unknown>) ?? {},
    }))
  } catch {
    return []
  }
}

export function createIdentityRecord(params: {
  agentId: string
  address: string
  name: string
  description: string
  skills: string[]
  network?: 'mainnet' | 'devnet'
}): AgentIdentity {
  const network = params.network ?? 'devnet'
  return {
    agentId: params.agentId,
    address: params.address,
    did: buildAgentDid(params.address, network),
    name: params.name,
    description: params.description,
    skills: params.skills,
    createdAt: Date.now(),
    network,
    verified: false,
  }
}
