// MultiversX integration — rewritten with correct sdk-core + sdk-dapp API
// SDK docs: https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook/

export const MVX_NETWORK = (process.env.NEXT_PUBLIC_MVX_NETWORK ?? 'devnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet'

export const MVX_API =
  MVX_NETWORK === 'mainnet'
    ? 'https://api.multiversx.com'
    : MVX_NETWORK === 'testnet'
    ? 'https://testnet-api.multiversx.com'
    : 'https://devnet-api.multiversx.com'

export const MVX_GATEWAY =
  MVX_NETWORK === 'mainnet'
    ? 'https://gateway.multiversx.com'
    : MVX_NETWORK === 'testnet'
    ? 'https://testnet-gateway.multiversx.com'
    : 'https://devnet-gateway.multiversx.com'

export const MVX_EXPLORER =
  MVX_NETWORK === 'mainnet'
    ? 'https://explorer.multiversx.com'
    : MVX_NETWORK === 'testnet'
    ? 'https://testnet-explorer.multiversx.com'
    : 'https://devnet-explorer.multiversx.com'

// ─── Types ───────────────────────────────────────────────────────────────────
export interface MvxAccount {
  address: string
  balance: string       // raw denomination (10^18)
  balanceEgld: string   // human readable
  nonce: number
  txCount: number
  username?: string
}

export interface AgentRegistration {
  address: string
  agentId: string
  capabilities: string[]
  pricePerTask?: string
  registeredAt?: string
}

export interface MvxTransaction {
  txHash: string
  sender: string
  receiver: string
  value: string
  valueEgld: string
  fee?: string
  status: string
  function?: string
  timestamp: number
  explorerUrl: string
}

// ─── Account ─────────────────────────────────────────────────────────────────
export async function getAccount(address: string): Promise<MvxAccount | null> {
  try {
    const res = await fetch(`${MVX_API}/accounts/${address}`, {
      next: { revalidate: 10 },
    })
    if (!res.ok) return null
    const d = await res.json()
    const raw = BigInt(d.balance ?? '0')
    return {
      address: d.address,
      balance: d.balance,
      balanceEgld: (Number(raw) / 1e18).toFixed(6),
      nonce: d.nonce,
      txCount: d.txCount,
      username: d.username,
    }
  } catch {
    return null
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function getAccountTransactions(
  address: string,
  size = 20
): Promise<MvxTransaction[]> {
  try {
    const res = await fetch(
      `${MVX_API}/accounts/${address}/transactions?size=${size}&order=desc&withOperations=true`,
      { next: { revalidate: 15 } }
    )
    if (!res.ok) return []
    const txs: any[] = await res.json()
    return txs.map((tx) => ({
      txHash: tx.txHash,
      sender: tx.sender,
      receiver: tx.receiver,
      value: tx.value,
      valueEgld: (Number(BigInt(tx.value ?? '0')) / 1e18).toFixed(6),
      fee: tx.fee,
      status: tx.status,
      function: tx.function,
      timestamp: tx.timestamp,
      explorerUrl: `${MVX_EXPLORER}/transactions/${tx.txHash}`,
    }))
  } catch {
    return []
  }
}

// ─── Smart Contract — Agent Registry ─────────────────────────────────────────
// Contract address — set via env var once deployed on devnet
const REGISTRY_SC = process.env.NEXT_PUBLIC_REGISTRY_SC ?? ''

export async function fetchRegisteredAgents(): Promise<AgentRegistration[]> {
  // If no SC deployed yet, return mock data for dev
  if (!REGISTRY_SC) {
    return [
      {
        address: 'erd1qqqqqqqqqqqqqpgqagentmock000000000000000000000000000000000',
        agentId: 'agent:main:main',
        capabilities: ['code', 'web', 'data-analysis'],
        pricePerTask: '0.001',
        registeredAt: new Date().toISOString(),
      },
    ]
  }

  // Query SC via API — getAgents view function
  try {
    const res = await fetch(`${MVX_API}/vm-values/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scAddress: REGISTRY_SC,
        funcName: 'getAgents',
        args: [],
      }),
      next: { revalidate: 30 },
    })
    if (!res.ok) return []
    const data = await res.json()
    // Decode base64 return values
    const returnData: string[] = data.data?.returnData ?? []
    return returnData.map((b64) => {
      const decoded = Buffer.from(b64, 'base64').toString('utf-8')
      try {
        return JSON.parse(decoded) as AgentRegistration
      } catch {
        return { address: '', agentId: decoded, capabilities: [] }
      }
    })
  } catch {
    return []
  }
}

// ─── Token balances ───────────────────────────────────────────────────────────
export async function getAccountTokens(address: string) {
  try {
    const res = await fetch(
      `${MVX_API}/accounts/${address}/tokens?size=20`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
