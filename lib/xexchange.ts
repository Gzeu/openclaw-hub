/**
 * xExchange DeFi integration for OpenClaw Hub
 *
 * Uses the MultiversX MEX API (keyless, no auth needed) to:
 *   • Fetch token list and pair info
 *   • Get price quotes with slippage
 *   • Build swap tx arguments for ACP sc_call
 *
 * MEX API docs: https://api.multiversx.com/mex/ (mainnet only)
 * On devnet — returns realistic mock data so the full flow is testable.
 *
 * Swap tx pattern (ESDTTransfer to pair contract):
 *   func: ESDTTransfer
 *   args: [tokenIn_hex, amountIn_hex, "swapTokensFixedInput"_hex, tokenOut_hex, amountOutMin_hex]
 */
import { MVX_API, MVX_NETWORK } from './multiversx'

// ---------------------------------------------------------------------------
// SC addresses
// ---------------------------------------------------------------------------
export const XEXCHANGE_ROUTER: Record<string, string> = {
  mainnet: process.env.XEXCHANGE_ROUTER_SC ??
    'erd1qqqqqqqqqqqqqpgqq67uv84ma3cekpa55l4l68ajzhq8qm3s896qykk2ke',
  devnet:  process.env.XEXCHANGE_ROUTER_SC ??
    'erd1qqqqqqqqqqqqqpgqq67uv84ma3cekpa55l4l68ajzhq8qm3s896qykk2ke',
  testnet: process.env.XEXCHANGE_ROUTER_SC ?? '',
}

export const WEGLD_ID =
  MVX_NETWORK === 'mainnet'
    ? (process.env.WEGLD_TOKEN_ID ?? 'WEGLD-bd4d79')
    : (process.env.WEGLD_TOKEN_ID ?? 'WEGLD-d7c6bb')

export const ROUTER_SC = XEXCHANGE_ROUTER[MVX_NETWORK] ?? XEXCHANGE_ROUTER.mainnet

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface MexToken {
  identifier: string
  name:       string
  ticker:     string
  price:      number
  marketCap?: number
  volume24h?: number
}

export interface MexPair {
  address:     string
  firstToken:  { identifier: string; name: string; price: number }
  secondToken: { identifier: string; name: string; price: number }
  totalValue?: number
  volume24h?:  number
  apr?:        number
  state:       string
}

export interface SwapQuote {
  tokenIn:             string
  tokenOut:            string
  amountIn:            string  // raw denomination (18 decimals)
  amountOutEstimated:  string  // raw denomination before slippage
  amountOutMin:        string  // raw denomination after slippage
  priceImpact:         number  // %
  slippage:            number  // % applied
  pairAddress:         string
  ratioHuman:          string  // e.g. "1 WEGLD ≈ 347,560 MEX"
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function hexEncode(s: string): string {
  return Buffer.from(s, 'utf-8').toString('hex')
}

export function bigIntToHex(n: bigint): string {
  const h = n.toString(16)
  return h.length % 2 === 0 ? h : '0' + h
}

function toRaw18(human: string): bigint {
  const [int, frac = ''] = human.split('.')
  const fracPadded = frac.padEnd(18, '0').slice(0, 18)
  return BigInt(int) * BigInt('1000000000000000000') + BigInt(fracPadded)
}

const IS_MAINNET = MVX_NETWORK === 'mainnet'

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function mexGet<T>(path: string, fallback: T): Promise<T> {
  if (!IS_MAINNET) return fallback
  try {
    const res = await fetch(`${MVX_API}${path}`, { next: { revalidate: 30 } })
    if (!res.ok) return fallback
    return res.json() as Promise<T>
  } catch {
    return fallback
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** List MEX tokens. On devnet returns mock data. */
export async function getMexTokens(size = 20): Promise<MexToken[]> {
  return mexGet<MexToken[]>(`/mex/tokens?size=${size}`, getMockTokens())
}

/** List xExchange pairs. On devnet returns mock data. */
export async function getMexPairs(size = 20): Promise<MexPair[]> {
  return mexGet<MexPair[]>(`/mex/pairs?size=${size}`, getMockPairs())
}

/** Find the pair contract for tokenIn/tokenOut (tries both orderings). */
export async function findPair(
  tokenIn:  string,
  tokenOut: string
): Promise<MexPair | null> {
  if (!IS_MAINNET) {
    const mocks = getMockPairs()
    return mocks.find(
      (p) =>
        (p.firstToken.identifier === tokenIn  && p.secondToken.identifier === tokenOut) ||
        (p.firstToken.identifier === tokenOut && p.secondToken.identifier === tokenIn)
    ) ?? null
  }
  for (const [a, b] of [[tokenIn, tokenOut], [tokenOut, tokenIn]]) {
    try {
      const res = await fetch(`${MVX_API}/mex/pairs/${a}/${b}`, {
        next: { revalidate: 15 },
      })
      if (res.ok) return res.json() as Promise<MexPair>
    } catch { /* try next */ }
  }
  return null
}

/**
 * Get a swap quote for amountIn (human-readable, e.g. "0.5") and slippage %.
 * Uses price ratio from MEX API (simplified AMM estimate).
 */
export async function getSwapQuote(params: {
  tokenIn:   string
  tokenOut:  string
  amountIn:  string
  slippage?: number
}): Promise<SwapQuote | null> {
  const { tokenIn, tokenOut, amountIn, slippage = 1 } = params

  const pair = await findPair(tokenIn, tokenOut)
  if (!pair) return null

  const priceIn  = pair.firstToken.identifier  === tokenIn  ? pair.firstToken.price  : pair.secondToken.price
  const priceOut = pair.firstToken.identifier  === tokenOut ? pair.firstToken.price  : pair.secondToken.price

  if (!priceIn || !priceOut) return null

  const ratio         = priceIn / priceOut
  const amountInFloat = parseFloat(amountIn)
  const amountOutEst  = amountInFloat * ratio
  const amountOutMin  = amountOutEst * (1 - slippage / 100)

  const priceImpact = pair.totalValue
    ? Math.min((amountInFloat * priceIn) / pair.totalValue * 100, 99)
    : 0.05

  const ratioHuman = `1 ${tokenIn.split('-')[0]} ≈ ${ratio.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${tokenOut.split('-')[0]}`

  return {
    tokenIn,
    tokenOut,
    amountIn:            toRaw18(amountIn).toString(),
    amountOutEstimated:  toRaw18(amountOutEst.toFixed(18)).toString(),
    amountOutMin:        toRaw18(amountOutMin.toFixed(18)).toString(),
    priceImpact:         Math.round(priceImpact * 1000) / 1000,
    slippage,
    pairAddress:         pair.address,
    ratioHuman,
  }
}

/**
 * Build ACP sc_call args for an ESDTTransfer swap on xExchange.
 *
 * Call pattern sent to pair contract:
 *   ESDTTransfer @ tokenIn_hex @ amountIn_hex @ swapTokensFixedInput_hex @ tokenOut_hex @ amountOutMin_hex
 */
export function buildSwapArgs(quote: SwapQuote): string[] {
  return [
    hexEncode(quote.tokenIn),
    bigIntToHex(BigInt(quote.amountIn)),
    hexEncode('swapTokensFixedInput'),
    hexEncode(quote.tokenOut),
    bigIntToHex(BigInt(quote.amountOutMin)),
  ]
}

// ---------------------------------------------------------------------------
// Mock data (devnet — realistic prices, Feb 2026)
// ---------------------------------------------------------------------------
function getMockTokens(): MexToken[] {
  return [
    { identifier: WEGLD_ID,       name: 'Wrapped EGLD',   ticker: 'WEGLD', price: 28.5,      marketCap: 720_000_000 },
    { identifier: 'MEX-455c57',   name: 'Maiar Exchange',  ticker: 'MEX',   price: 0.0000825, marketCap: 82_000_000 },
    { identifier: 'USDC-c76f1f',  name: 'USD Coin',        ticker: 'USDC',  price: 1.0,       marketCap: 1_000_000_000 },
    { identifier: 'UTK-2f80e9',   name: 'Utrust',          ticker: 'UTK',   price: 0.065,     marketCap: 30_000_000 },
    { identifier: 'RIDE-7d18e9',  name: 'holoride',        ticker: 'RIDE',  price: 0.012,     marketCap: 8_000_000 },
    { identifier: 'ZPAY-247875',  name: 'ZoidPay',         ticker: 'ZPAY',  price: 0.028,     marketCap: 14_000_000 },
  ]
}

function getMockPairs(): MexPair[] {
  return [
    {
      address:     'erd1qqqqqqqqqqqqqpgqeel2kumf0r8ffyhth7pqdujjat9nx0862jpsg2pqaq',
      firstToken:  { identifier: WEGLD_ID,      name: 'Wrapped EGLD',  price: 28.5 },
      secondToken: { identifier: 'MEX-455c57',  name: 'Maiar Exchange', price: 0.0000825 },
      totalValue: 1_200_000, volume24h: 45_000, apr: 12.4, state: 'Active',
    },
    {
      address:     'erd1qqqqqqqqqqqqqpgquu6aezffyf8hpnffaqmzvu5kl5e2ngfp7q2syxkk7m',
      firstToken:  { identifier: WEGLD_ID,      name: 'Wrapped EGLD', price: 28.5 },
      secondToken: { identifier: 'USDC-c76f1f', name: 'USD Coin',      price: 1.0 },
      totalValue: 2_800_000, volume24h: 120_000, apr: 8.2, state: 'Active',
    },
    {
      address:     'erd1qqqqqqqqqqqqqpgqhfmgqnzqk7kxsmfg6kz6vz6gy8a0d8rqsy2sxg30dv',
      firstToken:  { identifier: WEGLD_ID,      name: 'Wrapped EGLD', price: 28.5 },
      secondToken: { identifier: 'UTK-2f80e9',  name: 'Utrust',        price: 0.065 },
      totalValue: 350_000, volume24h: 12_000, apr: 18.6, state: 'Active',
    },
    {
      address:     'erd1qqqqqqqqqqqqqpgqvn4fq9lqxzgkue0ky35ww9lmjljfxv56esy2sjmkz9s',
      firstToken:  { identifier: WEGLD_ID,      name: 'Wrapped EGLD', price: 28.5 },
      secondToken: { identifier: 'RIDE-7d18e9', name: 'holoride',      price: 0.012 },
      totalValue: 180_000, volume24h: 6_500, apr: 22.1, state: 'Active',
    },
  ]
}
