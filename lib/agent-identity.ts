// lib/agent-identity.ts
import { getMvxApiBase } from './multiversx-client'

export interface AgentIdentity {
  agentId: string          // uuid intern
  address: string          // erd1... wallet MultiversX
  did: string              // did:mvx:mainnet:erd1...
  name: string
  description: string
  skills: string[]         // skill IDs din skills.ts
  nftNonce?: number        // dacă identitatea e mintată ca SFT
  nftCollection?: string   // e.g. CLAWID-xxxxxx
  createdAt: number
  network: 'mainnet' | 'devnet'
  verified: boolean        // confirmat on-chain
}

export interface IdentityProof {
  address: string
  message: string          // mesaj canonical semnat
  signature: string        // hex signature Ed25519
  timestamp: number
}

/** Generează DID canonical pentru un agent MVX */
export function buildAgentDid(
  address: string,
  network: 'mainnet' | 'devnet' = 'mainnet'
): string {
  return `did:mvx:${network}:${address}`
}

/** Mesaj canonical pentru proof-of-identity (semnat off-chain de agent) */
export function buildIdentityMessage(agentId: string, timestamp: number): string {
  return `openclaw-identity:${agentId}:${timestamp}`
}

/** Verifică on-chain că adresa există și are cel puțin 1 tx */
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

/** Caută NFT-uri de tip CLAWID deținute de adresă (identity tokens) */
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

/** Construiește identitate completă pt un agent nou (off-chain, fără mint) */
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
