import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type JsonRpcReq = {
  jsonrpc: '2.0'
  id: string | number | null
  method: string
  params?: any
}

type JsonRpcRes = {
  jsonrpc: '2.0'
  id: string | number | null
  result?: any
  error?: { code: number; message: string; data?: any }
}

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Access-Control-Allow-Origin': '*',
}

// ---------------------------------------------------------------------------
// Tool definitions (5 tools)
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    name: 'openclaw.skills.list',
    description: 'List all skills exposed by OpenClaw Hub (GET /api/skills).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'openclaw.skills.match',
    description: 'Match a natural-language task description to the most relevant OpenClaw Hub skills.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Natural-language description of what you want to do.' },
      },
      required: ['task'],
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw.acp.build',
    description:
      'Build an unsigned MultiversX transaction (ACP — Agent Commerce Protocol). ' +
      'Actions: transfer_egld | transfer_esdt | sc_call | pay_skill. ' +
      'Returns unsigned tx — caller must sign and broadcast via /api/acp/broadcast.',
    inputSchema: {
      type: 'object',
      properties: {
        action:    { type: 'string', enum: ['transfer_egld', 'transfer_esdt', 'sc_call', 'pay_skill'] },
        sender:    { type: 'string', description: 'erd1 sender address.' },
        receiver:  { type: 'string', description: 'erd1 receiver (transfer_egld).' },
        amount:    { type: 'string', description: 'Amount in EGLD e.g. "0.001" (transfer_egld).' },
        tokenId:   { type: 'string', description: 'ESDT token identifier (transfer_esdt).' },
        contract:  { type: 'string', description: 'SC erd1 address (sc_call).' },
        func:      { type: 'string', description: 'Function name (sc_call).' },
        args:      { type: 'array', items: { type: 'string' }, description: 'Hex-encoded args (sc_call).' },
        skillId:   { type: 'string', description: 'Skill ID to pay for (pay_skill).' },
        priceEgld: { type: 'string', description: 'Price in EGLD (pay_skill).' },
        taskId:    { type: 'string', description: 'Optional task ID (pay_skill).' },
        value:     { type: 'string', description: 'EGLD in raw denom to attach (sc_call).' },
        gasLimit:  { type: 'number', description: 'Custom gas limit (sc_call).' },
        data:      { type: 'string', description: 'Memo field (transfer_egld / transfer_esdt).' },
      },
      required: ['action', 'sender'],
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw.defi.swap',
    description:
      'Build an unsigned xExchange DeFi swap transaction (ESDT token swap on MultiversX DEX). ' +
      'Same mechanism used by Max (MultiversX autonomous agent). ' +
      'Returns swap quote + unsigned ACP sc_call tx — caller signs and broadcasts via /api/acp/broadcast.',
    inputSchema: {
      type: 'object',
      properties: {
        sender:   { type: 'string', description: 'erd1 sender address.' },
        tokenIn:  { type: 'string', description: 'ESDT identifier to swap FROM (use WEGLD for EGLD swaps). E.g. WEGLD-bd4d79' },
        tokenOut: { type: 'string', description: 'ESDT identifier to swap TO. E.g. MEX-455c57' },
        amountIn: { type: 'string', description: 'Human-readable amount e.g. "0.5"' },
        slippage: { type: 'number', description: 'Slippage tolerance % (0.1-50), default 1.' },
      },
      required: ['sender', 'tokenIn', 'tokenOut', 'amountIn'],
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw.agent.identity',
    description:
      'Get or create an OpenClaw agent on-chain identity. ' +
      'action=get: lookup DID + NFT identity tokens for an erd1 address. ' +
      'action=create: register a new agent identity off-chain and return the message to sign for proof-of-ownership.',
    inputSchema: {
      type: 'object',
      properties: {
        action:      { type: 'string', enum: ['get', 'create'], description: 'get=lookup existing, create=new identity' },
        address:     { type: 'string', description: 'erd1... MultiversX address of the agent.' },
        name:        { type: 'string', description: 'Agent display name (required for create).' },
        description: { type: 'string', description: 'Short description of the agent (create).' },
        skills:      { type: 'array', items: { type: 'string' }, description: 'Skill IDs the agent offers (create).' },
      },
      required: ['action', 'address'],
      additionalProperties: false,
    },
  },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ok(id: JsonRpcRes['id'], result: any): JsonRpcRes {
  return { jsonrpc: '2.0', id, result }
}

function rpcErr(id: JsonRpcRes['id'], code: number, message: string, data?: any): JsonRpcRes {
  return { jsonrpc: '2.0', id, error: { code, message, ...(data !== undefined ? { data } : {}) } }
}

function checkApiKey(req: NextRequest, id: JsonRpcRes['id']): NextResponse | null {
  const key = process.env.MCP_API_KEY?.trim()
  if (!key) return null
  const provided = req.headers.get('x-mcp-api-key') ?? ''
  if (provided !== key) {
    return NextResponse.json(
      rpcErr(id, 401, 'Unauthorized', { message: 'Missing or invalid x-mcp-api-key header.' }),
      { status: 401, headers: BASE_HEADERS }
    )
  }
  return null
}

async function proxyJson(origin: string, path: string, init?: RequestInit) {
  const res = await fetch(origin + path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  return { status: res.status, json }
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------
export async function GET() {
  return NextResponse.json(
    { hint: 'POST JSON-RPC 2.0. Methods: initialize | tools/list | tools/call', tools: TOOLS.length },
    { headers: BASE_HEADERS }
  )
}

export async function POST(req: NextRequest) {
  let body: JsonRpcReq
  try { body = await req.json() }
  catch { return NextResponse.json(rpcErr(null, -32700, 'Parse error'), { status: 400, headers: BASE_HEADERS }) }

  const id = body?.id ?? null

  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return NextResponse.json(rpcErr(id, -32600, 'Invalid Request'), { status: 400, headers: BASE_HEADERS })
  }

  const authErr = checkApiKey(req, id)
  if (authErr) return authErr

  const origin = new URL(req.url).origin

  // ── initialize
  if (body.method === 'initialize') {
    return NextResponse.json(
      ok(id, {
        protocolVersion: '2025-11-25',
        serverInfo: { name: 'openclaw-hub', version: '0.3.0' },
        capabilities: { tools: { listChanged: false } },
      }),
      { headers: BASE_HEADERS }
    )
  }

  // ── tools/list
  if (body.method === 'tools/list') {
    return NextResponse.json(ok(id, { tools: TOOLS }), { headers: BASE_HEADERS })
  }

  // ── tools/call
  if (body.method === 'tools/call') {
    const name = body.params?.name
    const args = body.params?.arguments ?? {}

    if (name === 'openclaw.skills.list') {
      const { status, json } = await proxyJson(origin, '/api/skills')
      if (status >= 400) return NextResponse.json(rpcErr(id, -32000, 'Upstream /api/skills failed', { status }), { headers: BASE_HEADERS })
      return NextResponse.json(ok(id, { content: [{ type: 'text', text: JSON.stringify(json) }], isError: false }), { headers: BASE_HEADERS })
    }

    if (name === 'openclaw.skills.match') {
      if (typeof args.task !== 'string' || !args.task.trim()) {
        return NextResponse.json(rpcErr(id, -32602, 'Invalid params: task (string) is required'), { headers: BASE_HEADERS })
      }
      const { status, json } = await proxyJson(origin, '/api/skills', { method: 'POST', body: JSON.stringify({ task: args.task }) })
      if (status >= 400) return NextResponse.json(rpcErr(id, -32000, 'Upstream POST /api/skills failed', { status }), { headers: BASE_HEADERS })
      return NextResponse.json(ok(id, { content: [{ type: 'text', text: JSON.stringify(json) }], isError: false }), { headers: BASE_HEADERS })
    }

    if (name === 'openclaw.acp.build') {
      if (!args.action || !args.sender) {
        return NextResponse.json(rpcErr(id, -32602, 'Invalid params: action and sender are required'), { headers: BASE_HEADERS })
      }
      const { status, json } = await proxyJson(origin, '/api/acp', { method: 'POST', body: JSON.stringify(args) })
      if (status >= 400) return NextResponse.json(rpcErr(id, -32000, 'ACP build failed', { status, body: json }), { headers: BASE_HEADERS })
      return NextResponse.json(ok(id, { content: [{ type: 'text', text: JSON.stringify(json) }], isError: false }), { headers: BASE_HEADERS })
    }

    if (name === 'openclaw.defi.swap') {
      if (!args.sender || !args.tokenIn || !args.tokenOut || !args.amountIn) {
        return NextResponse.json(
          rpcErr(id, -32602, 'Invalid params: sender, tokenIn, tokenOut, amountIn are required'),
          { headers: BASE_HEADERS }
        )
      }
      const { status, json } = await proxyJson(origin, '/api/skills/execute/defi-swap', {
        method: 'POST',
        body: JSON.stringify(args),
      })
      if (status >= 400) return NextResponse.json(rpcErr(id, -32000, 'DeFi swap failed', { status, body: json }), { headers: BASE_HEADERS })
      return NextResponse.json(ok(id, { content: [{ type: 'text', text: JSON.stringify(json) }], isError: false }), { headers: BASE_HEADERS })
    }

    if (name === 'openclaw.agent.identity') {
      if (!args.action || !args.address) {
        return NextResponse.json(
          rpcErr(id, -32602, 'Invalid params: action and address are required'),
          { headers: BASE_HEADERS }
        )
      }
      if (args.action === 'get') {
        const { status, json } = await proxyJson(
          origin,
          `/api/agents/identity?address=${encodeURIComponent(args.address)}`
        )
        if (status >= 400) return NextResponse.json(rpcErr(id, -32000, 'Identity lookup failed', { status }), { headers: BASE_HEADERS })
        return NextResponse.json(ok(id, { content: [{ type: 'text', text: JSON.stringify(json) }], isError: false }), { headers: BASE_HEADERS })
      }
      if (args.action === 'create') {
        if (!args.name) {
          return NextResponse.json(
            rpcErr(id, -32602, 'Invalid params: name is required for create'),
            { headers: BASE_HEADERS }
          )
        }
        const { status, json } = await proxyJson(origin, '/api/agents/identity', {
          method: 'POST',
          body: JSON.stringify({
            address: args.address,
            name: args.name,
            description: args.description ?? '',
            skills: args.skills ?? [],
          }),
        })
        if (status >= 400) return NextResponse.json(rpcErr(id, -32000, 'Identity create failed', { status, body: json }), { headers: BASE_HEADERS })
        return NextResponse.json(ok(id, { content: [{ type: 'text', text: JSON.stringify(json) }], isError: false }), { headers: BASE_HEADERS })
      }
      return NextResponse.json(rpcErr(id, -32602, `Unknown action: ${args.action}`), { headers: BASE_HEADERS })
    }

    return NextResponse.json(rpcErr(id, -32601, `Unknown tool: ${String(name)}`), { status: 404, headers: BASE_HEADERS })
  }

  return NextResponse.json(rpcErr(id, -32601, `Method not found: ${body.method}`), { status: 404, headers: BASE_HEADERS })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...BASE_HEADERS,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, x-mcp-api-key',
    },
  })
}
