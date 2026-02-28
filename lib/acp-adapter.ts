/**
 * ACP Adapter — Agent Commerce Protocol for MultiversX
 *
 * Builds UNSIGNED transaction descriptors following the ACP spec.
 * No private keys are held here — transactions must be signed by the agent's
 * wallet (sdk-dapp, WalletConnect, Ledger) or submitted to a Relayed v3
 * relayer for gasless execution.
 *
 * References:
 *   MultiversX Universal Agentic Commerce Stack:
 *   https://multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack
 */
import { MVX_API, MVX_GATEWAY, MVX_NETWORK, MVX_EXPLORER } from './multiversx'

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
export type AcpAction =
  | 'transfer_egld'
  | 'transfer_esdt'
  | 'sc_call'
  | 'pay_skill'

export interface AcpTransferEgld {
  action: 'transfer_egld'
  sender: string
  receiver: string
  amount: string    // in EGLD e.g. "0.001"
  data?: string
}

export interface AcpTransferEsdt {
  action: 'transfer_esdt'
  sender: string
  receiver: string
  tokenId: string
  amount: string    // raw denomination
  data?: string
}

export interface AcpScCall {
  action: 'sc_call'
  sender: string
  contract: string
  func: string
  args: string[]    // hex-encoded arguments
  value?: string    // EGLD value to attach (raw denomination)
  gasLimit?: number
}

export interface AcpPaySkill {
  action: 'pay_skill'
  sender: string
  skillId: string
  priceEgld: string // e.g. "0.0001"
  taskId?: string   // correlates payment to a specific task
}

export type AcpRequest =
  | AcpTransferEgld
  | AcpTransferEsdt
  | AcpScCall
  | AcpPaySkill

// ---------------------------------------------------------------------------
// Unsigned tx descriptor (matches MVX gateway /transaction/send schema)
// ---------------------------------------------------------------------------
export interface UnsignedMvxTx {
  nonce:     number
  value:     string      // raw denomination string
  receiver:  string
  sender:    string
  gasPrice:  number
  gasLimit:  number
  data?:     string      // base64-encoded data field
  chainID:   string
  version:   number
  // ACP metadata — informational, stripped before on-chain broadcast
  _acp?: {
    action:            AcpAction
    skillId?:          string
    taskId?:           string
    x402?:             boolean
    estimatedFeeEgld?: string
    explorerBase?:     string
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CHAIN_ID: Record<string, string> = {
  mainnet: '1',
  testnet: 'T',
  devnet:  'D',
}

const GAS_PRICE          = 1_000_000_000
const MIN_GAS_LIMIT      = 50_000
const EXTRA_GAS_PER_BYTE = 1_500

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function egldToRaw(egld: string): bigint {
  const [int, frac = ''] = egld.split('.')
  const fracPadded = frac.padEnd(18, '0').slice(0, 18)
  return BigInt(int) * BigInt('1000000000000000000') + BigInt(fracPadded)
}

function b64(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64')
}

function estimateFeeEgld(gasLimit: number): string {
  return ((GAS_PRICE * gasLimit) / 1e18).toFixed(8)
}

async function getNonce(address: string): Promise<number> {
  try {
    const res = await fetch(`${MVX_API}/accounts/${address}?fields=nonce`, {
      cache: 'no-store',
    })
    if (!res.ok) return 0
    const d = await res.json()
    return d.nonce ?? 0
  } catch {
    return 0
  }
}

// ---------------------------------------------------------------------------
// Build unsigned tx from ACP request
// ---------------------------------------------------------------------------
export async function buildAcpTx(req: AcpRequest): Promise<UnsignedMvxTx> {
  const chainID = CHAIN_ID[MVX_NETWORK] ?? 'D'
  const nonce   = await getNonce(req.sender)

  // ── transfer_egld ──────────────────────────────────────────
  if (req.action === 'transfer_egld') {
    const dataStr  = req.data
    const dataLen  = dataStr ? Buffer.byteLength(dataStr) : 0
    const gasLimit = MIN_GAS_LIMIT + dataLen * EXTRA_GAS_PER_BYTE
    const tx: UnsignedMvxTx = {
      nonce,
      value:    egldToRaw(req.amount).toString(),
      receiver: req.receiver,
      sender:   req.sender,
      gasPrice: GAS_PRICE,
      gasLimit,
      chainID,
      version:  1,
      _acp: { action: 'transfer_egld', estimatedFeeEgld: estimateFeeEgld(gasLimit), explorerBase: MVX_EXPLORER },
    }
    if (dataStr) tx.data = b64(dataStr)
    return tx
  }

  // ── pay_skill ─────────────────────────────────────────────
  // Skill payment follows x402 semantics: receiver = Hub wallet, data encodes skill + task
  if (req.action === 'pay_skill') {
    const receiver = process.env.MVX_WALLET_ADDRESS ?? req.sender
    const skillHex = Buffer.from(req.skillId).toString('hex')
    const taskHex  = req.taskId ? '@' + Buffer.from(req.taskId).toString('hex') : ''
    const dataStr  = `pay_skill@${skillHex}${taskHex}`
    const gasLimit = MIN_GAS_LIMIT + Buffer.byteLength(dataStr) * EXTRA_GAS_PER_BYTE
    const tx: UnsignedMvxTx = {
      nonce,
      value:    egldToRaw(req.priceEgld).toString(),
      receiver,
      sender:   req.sender,
      gasPrice: GAS_PRICE,
      gasLimit,
      data:     b64(dataStr),
      chainID,
      version:  1,
      _acp: {
        action:            'pay_skill',
        skillId:           req.skillId,
        taskId:            req.taskId,
        x402:              true,
        estimatedFeeEgld:  estimateFeeEgld(gasLimit),
        explorerBase:      MVX_EXPLORER,
      },
    }
    return tx
  }

  // ── transfer_esdt ─────────────────────────────────────────
  if (req.action === 'transfer_esdt') {
    const amountHex = BigInt(req.amount).toString(16)
    const tokenHex  = Buffer.from(req.tokenId).toString('hex')
    const dataStr   = `ESDTTransfer@${tokenHex}@${amountHex}${req.data ? '@' + b64(req.data) : ''}`
    const gasLimit  = 500_000 + Buffer.byteLength(dataStr) * EXTRA_GAS_PER_BYTE
    return {
      nonce,
      value:    '0',
      receiver: req.receiver,
      sender:   req.sender,
      gasPrice: GAS_PRICE,
      gasLimit,
      data:     b64(dataStr),
      chainID,
      version:  1,
      _acp: { action: 'transfer_esdt', estimatedFeeEgld: estimateFeeEgld(gasLimit), explorerBase: MVX_EXPLORER },
    }
  }

  // ── sc_call ──────────────────────────────────────────────
  if (req.action === 'sc_call') {
    const dataStr  = [req.func, ...req.args].join('@')
    const gasLimit = req.gasLimit ?? (3_000_000 + Buffer.byteLength(dataStr) * EXTRA_GAS_PER_BYTE)
    return {
      nonce,
      value:    req.value ?? '0',
      receiver: req.contract,
      sender:   req.sender,
      gasPrice: GAS_PRICE,
      gasLimit,
      data:     b64(dataStr),
      chainID,
      version:  1,
      _acp: { action: 'sc_call', estimatedFeeEgld: estimateFeeEgld(gasLimit), explorerBase: MVX_EXPLORER },
    }
  }

  throw new Error(`Unknown ACP action: ${(req as any).action}`)
}

// ---------------------------------------------------------------------------
// Broadcast signed tx to MVX gateway
// ---------------------------------------------------------------------------
export async function broadcastSignedTx(
  signedTx: Omit<UnsignedMvxTx, '_acp'> & { signature: string }
): Promise<{ txHash: string; explorerUrl: string }> {
  const { _acp: _stripped, ...payload } = signedTx as any

  const res = await fetch(`${MVX_GATEWAY}/transaction/send`, {
    method:  'POST',
    headers: { 'content-type': 'application/json' },
    body:    JSON.stringify(payload),
    cache:   'no-store',
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`MVX gateway broadcast failed (${res.status}): ${errText}`)
  }

  const data    = await res.json()
  const txHash  = data?.data?.txHash ?? data?.txHash
  if (!txHash) throw new Error(`Broadcast succeeded but txHash missing: ${JSON.stringify(data)}`)

  return {
    txHash,
    explorerUrl: `${MVX_EXPLORER}/transactions/${txHash}`,
  }
}
