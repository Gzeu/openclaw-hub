/**
 * POST /api/acp/broadcast
 * Submit a SIGNED MultiversX transaction to the MVX gateway.
 *
 * Body: { ...unsignedTx (from /api/acp), signature: string }
 * Response: { success, txHash, explorerUrl }
 *
 * The _acp metadata field is stripped before sending to the chain.
 */
import { NextRequest, NextResponse } from 'next/server'
import { broadcastSignedTx } from '@/lib/acp-adapter'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS })
  }

  if (!body?.signature || !body?.sender || !body?.receiver) {
    return NextResponse.json(
      {
        error: 'Missing required fields: sender, receiver, signature (plus full unsigned tx fields from /api/acp)',
      },
      { status: 400, headers: CORS }
    )
  }

  try {
    const result = await broadcastSignedTx(body)
    return NextResponse.json(
      { success: true, ...result },
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
    { hint: 'POST { ...unsignedTx, signature } here after signing the tx from /api/acp.' },
    { headers: CORS }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' },
  })
}
