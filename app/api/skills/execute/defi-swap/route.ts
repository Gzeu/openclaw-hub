/**
 * POST /api/skills/execute/defi-swap
 *
 * xExchange DeFi swap skill — builds an UNSIGNED ACP sc_call transaction.
 *
 * Flow:
 *   1. Validate request body (sender, tokenIn, tokenOut, amountIn, slippage)
 *   2. Fetch swap quote from xExchange MEX API (or devnet mock)
 *   3. Build ESDTTransfer sc_call args via lib/xexchange.ts
 *   4. Return unsigned tx via lib/acp-adapter.ts (caller signs + broadcasts)
 *
 * The caller must:
 *   a) Sign tx.signature with their wallet (sdk-dapp / Ledger / WalletConnect)
 *   b) POST to /api/acp/broadcast
 *
 * GET /api/skills/execute/defi-swap — returns usage docs + available pairs + tokens
 *
 * x402: Response includes payment headers for the defi_swap skill
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSwapQuote, buildSwapArgs, getMexTokens, getMexPairs, WEGLD_ID, ROUTER_SC } from '@/lib/xexchange'
import { buildAcpTx } from '@/lib/acp-adapter'
import { MVX_NETWORK, MVX_EXPLORER } from '@/lib/multiversx'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

const X402 = {
  ...CORS,
  'X-402-Version':      '1',
  'X-402-Currency':     'EGLD',
  'X-402-Network':      MVX_NETWORK,
  'X-402-Receiver':     process.env.MVX_WALLET_ADDRESS ?? '',
  'X-402-Price-EGLD':   '0.0005',
  'X-402-Pay-Endpoint': '/api/acp',
  'X-402-Pay-Action':   'pay_skill',
  'X-402-Skill-Id':     'defi_swap',
  'Access-Control-Expose-Headers':
    'X-402-Version, X-402-Currency, X-402-Network, X-402-Receiver, X-402-Price-EGLD, X-402-Pay-Endpoint, X-402-Pay-Action, X-402-Skill-Id',
}

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: X402 })
  }

  const { sender, tokenIn, tokenOut, amountIn, slippage = 1 } = body ?? {}

  if (!sender || !tokenIn || !tokenOut || !amountIn) {
    return NextResponse.json(
      { error: 'Missing required fields: sender, tokenIn, tokenOut, amountIn' },
      { status: 400, headers: X402 }
    )
  }

  if (typeof slippage !== 'number' || slippage < 0.1 || slippage > 50) {
    return NextResponse.json(
      { error: 'slippage must be a number between 0.1 and 50 (percent)' },
      { status: 400, headers: X402 }
    )
  }

  if (!/^erd1/.test(sender)) {
    return NextResponse.json(
      { error: 'sender must be a valid erd1 address' },
      { status: 400, headers: X402 }
    )
  }

  // Get swap quote
  const quote = await getSwapQuote({ tokenIn, tokenOut, amountIn: String(amountIn), slippage })

  if (!quote) {
    return NextResponse.json(
      {
        error: `No liquidity pair found for ${tokenIn} → ${tokenOut}.`,
        hint:  `Use WEGLD_ID=${WEGLD_ID} as base token. Check GET /api/skills/execute/defi-swap for available pairs.`,
      },
      { status: 404, headers: X402 }
    )
  }

  // Build swap args and ACP sc_call tx
  const swapArgs = buildSwapArgs(quote)

  let tx: Awaited<ReturnType<typeof buildAcpTx>>
  try {
    tx = await buildAcpTx({
      action:   'sc_call',
      sender,
      contract: quote.pairAddress,    // ESDTTransfer goes to the PAIR contract
      func:     'ESDTTransfer',
      args:     swapArgs,
      gasLimit: 12_000_000,           // xExchange swaps typically need 10-15M gas
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: X402 })
  }

  return NextResponse.json(
    {
      success: true,
      quote: {
        tokenIn:            quote.tokenIn,
        tokenOut:           quote.tokenOut,
        amountInHuman:      amountIn,
        amountOutEstimated: (Number(BigInt(quote.amountOutEstimated)) / 1e18).toFixed(6),
        amountOutMin:       (Number(BigInt(quote.amountOutMin)) / 1e18).toFixed(6),
        ratioHuman:         quote.ratioHuman,
        priceImpact:        `${quote.priceImpact}%`,
        slippage:           `${slippage}%`,
        pairAddress:        quote.pairAddress,
      },
      tx,
      meta: {
        network:           MVX_NETWORK,
        explorerBase:      MVX_EXPLORER,
        broadcastEndpoint: '/api/acp/broadcast',
        routerSC:          ROUTER_SC,
        wegldId:           WEGLD_ID,
        instructions:      [
          '1. Inspect quote — verify amountOutMin is acceptable',
          '2. Sign tx.signature with your wallet (sdk-dapp / Ledger / WalletConnect)',
          '3. POST { ...tx, signature } to /api/acp/broadcast',
          '4. Check explorerBase + txHash for confirmation',
        ],
        warning: MVX_NETWORK !== 'mainnet'
          ? '⚠️ Running on ' + MVX_NETWORK + ' — using mock pair data. Set NEXT_PUBLIC_MVX_NETWORK=mainnet for live quotes.'
          : undefined,
      },
    },
    { headers: X402 }
  )
}

export async function GET() {
  const [tokens, pairs] = await Promise.all([getMexTokens(10), getMexPairs(10)])

  return NextResponse.json(
    {
      description: 'xExchange DeFi swap skill — builds unsigned MVX swap tx via ACP sc_call.',
      network:     MVX_NETWORK,
      usage:       'POST /api/skills/execute/defi-swap',
      body: {
        sender:   'erd1... (required) — your wallet address',
        tokenIn:  'ESDT token identifier to swap FROM (required)',
        tokenOut: 'ESDT token identifier to swap TO (required)',
        amountIn: 'Human-readable amount e.g. "0.5" (required)',
        slippage: 'Slippage tolerance % — default 1, range 0.1-50 (optional)',
      },
      wegldId:     WEGLD_ID,
      routerSC:    ROUTER_SC,
      broadcast:   'POST /api/acp/broadcast with { ...tx, signature }',
      isDevnet:    MVX_NETWORK !== 'mainnet',
      tokens:      tokens.map(t => ({ identifier: t.identifier, ticker: t.ticker, price: t.price })),
      pairs:       pairs.map(p => ({
        address:    p.address,
        tokenA:     p.firstToken.identifier,
        tokenB:     p.secondToken.identifier,
        apr:        p.apr,
        volume24h:  p.volume24h,
        state:      p.state,
      })),
    },
    { headers: CORS }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' },
  })
}
