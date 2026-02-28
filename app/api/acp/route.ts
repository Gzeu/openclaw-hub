/**
 * POST /api/acp
 * Build an UNSIGNED MultiversX transaction from an ACP (Agent Commerce Protocol) request.
 *
 * The caller must:
 *   1. Sign the returned `tx` with their wallet (sdk-dapp / Ledger / WalletConnect)
 *   2. POST the signed tx to /api/acp/broadcast
 *
 * Supported actions: transfer_egld | transfer_esdt | sc_call | pay_skill
 *
 * GET /api/acp — returns usage docs (no auth required)
 *
 * Ref: https://multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack
 */
import { NextRequest, NextResponse } from 'next/server'
import { buildAcpTx, AcpRequest } from '@/lib/acp-adapter'
import { MVX_NETWORK, MVX_EXPLORER } from '@/lib/multiversx'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export async function POST(req: NextRequest) {
  let body: AcpRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS })
  }

  if (!body?.action || !body?.sender) {
    return NextResponse.json(
      { error: 'Missing required fields: action, sender' },
      { status: 400, headers: CORS }
    )
  }

  const validActions = ['transfer_egld', 'transfer_esdt', 'sc_call', 'pay_skill']
  if (!validActions.includes(body.action)) {
    return NextResponse.json(
      { error: `Unknown action. Valid: ${validActions.join(' | ')}` },
      { status: 400, headers: CORS }
    )
  }

  try {
    const tx = await buildAcpTx(body)
    const meta = tx._acp ?? {}

    return NextResponse.json(
      {
        success: true,
        tx,
        meta: {
          ...meta,
          network:             MVX_NETWORK,
          explorerBase:        MVX_EXPLORER,
          broadcastEndpoint:   '/api/acp/broadcast',
          instructions:        'Sign tx with your wallet then POST {  ...tx, signature } to /api/acp/broadcast',
        },
      },
      { headers: CORS }
    )
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500, headers: CORS }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      description: 'ACP (Agent Commerce Protocol) — unsigned MVX transaction builder.',
      network:     MVX_NETWORK,
      usage:       'POST /api/acp',
      actions: [
        { action: 'transfer_egld',  required: ['sender', 'receiver', 'amount'],                    optional: ['data'] },
        { action: 'transfer_esdt',  required: ['sender', 'receiver', 'tokenId', 'amount'],         optional: ['data'] },
        { action: 'sc_call',        required: ['sender', 'contract', 'func', 'args'],              optional: ['value', 'gasLimit'] },
        { action: 'pay_skill',      required: ['sender', 'skillId', 'priceEgld'],                  optional: ['taskId'] },
      ],
      broadcastEndpoint: 'POST /api/acp/broadcast — submit { ...unsignedTx, signature } to MVX gateway',
      x402: {
        description:   'Skills advertise their price via x402 headers on GET /api/skills responses.',
        payEndpoint:   '/api/acp',
        payAction:     'pay_skill',
      },
      docs: 'https://multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack',
    },
    { headers: CORS }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  })
}
