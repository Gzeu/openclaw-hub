// MultiversX integration — agent registry + payments

export const MVX_NETWORK = process.env.NEXT_PUBLIC_MVX_NETWORK ?? 'devnet'
export const MVX_API =
  MVX_NETWORK === 'mainnet'
    ? 'https://api.multiversx.com'
    : MVX_NETWORK === 'testnet'
    ? 'https://testnet-api.multiversx.com'
    : 'https://devnet-api.multiversx.com'

export interface AgentRegistration {
  address: string
  agentId: string
  capabilities: string[]
  pricePerTask?: string // in EGLD
}

export async function getAgentBalance(address: string): Promise<string> {
  const res = await fetch(`${MVX_API}/accounts/${address}`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) return '0'
  const data = await res.json()
  // Convert from denomination (10^18)
  const raw = BigInt(data.balance ?? '0')
  const egld = Number(raw) / 1e18
  return egld.toFixed(4)
}

export async function getAccountTransactions(
  address: string,
  size = 10
): Promise<any[]> {
  const res = await fetch(
    `${MVX_API}/accounts/${address}/transactions?size=${size}&order=desc`,
    { next: { revalidate: 30 } }
  )
  if (!res.ok) return []
  return res.json()
}

// Registry — stored on-chain via smart contract (stub for now, swap with SC call)
export async function fetchRegisteredAgents(): Promise<AgentRegistration[]> {
  // TODO: replace with actual SC query when contract is deployed
  // For now returns mock data to unblock UI development
  return [
    {
      address: 'erd1qqqqqqqqqqqqqpgqagentmock000000000000000000000000000000000',
      agentId: 'agent:main:main',
      capabilities: ['code', 'web', 'data-analysis'],
      pricePerTask: '0.001',
    },
  ]
}
