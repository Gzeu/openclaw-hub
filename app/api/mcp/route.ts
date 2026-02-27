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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Access-Control-Allow-Origin': '*',
}

/**
 * Tool definitions — MCP Tools spec (inputSchema is JSON Schema).
 * https://modelcontextprotocol.info/specification/2024-11-05/server/tools/
 */
const TOOLS = [
  {
    name: 'openclaw.skills.list',
    description: 'List all skills exposed by OpenClaw Hub (GET /api/skills).',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw.skills.match',
    description:
      'Match a natural-language task description to the most relevant OpenClaw Hub skills (POST /api/skills).',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Natural-language description of what you want to do.' },
      },
      required: ['task'],
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

/** Optional API key guard — only active when MCP_API_KEY env var is set. */
function checkApiKey(req: NextRequest, id: JsonRpcRes['id']): NextResponse | null {
  const key = process.env.MCP_API_KEY?.trim()
  if (!key) return null                                 // not configured → open access
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

/**
 * GET /api/mcp — human-readable hint
 */
export async function GET() {
  return NextResponse.json(
    { hint: 'POST JSON-RPC 2.0. Methods: initialize | tools/list | tools/call' },
    { headers: BASE_HEADERS }
  )
}

/**
 * POST /api/mcp — MCP JSON-RPC 2.0 endpoint
 *
 * Supported methods:
 *   initialize        — handshake + capability negotiation
 *   tools/list        — return all available tools with inputSchema
 *   tools/call        — invoke a tool by name with arguments
 *
 * Ref: https://modelcontextprotocol.info/specification/2024-11-05/server/tools/
 */
export async function POST(req: NextRequest) {
  // Parse body first so we can echo the id in error responses
  let body: JsonRpcReq
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(rpcErr(null, -32700, 'Parse error'), { status: 400, headers: BASE_HEADERS })
  }

  const id = body?.id ?? null

  // Basic JSON-RPC validation
  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return NextResponse.json(rpcErr(id, -32600, 'Invalid Request'), { status: 400, headers: BASE_HEADERS })
  }

  // Auth guard (noop if MCP_API_KEY not set)
  const authErr = checkApiKey(req, id)
  if (authErr) return authErr

  const origin = new URL(req.url).origin

  // -------------------------------------------------------------------------
  // Method dispatch
  // -------------------------------------------------------------------------

  // initialize — capability handshake
  if (body.method === 'initialize') {
    return NextResponse.json(
      ok(id, {
        protocolVersion: '2025-11-25',
        serverInfo: { name: 'openclaw-hub', version: '0.2.0' },
        capabilities: { tools: { listChanged: false } },
      }),
      { headers: BASE_HEADERS }
    )
  }

  // tools/list — enumerate all tools
  if (body.method === 'tools/list') {
    return NextResponse.json(ok(id, { tools: TOOLS }), { headers: BASE_HEADERS })
  }

  // tools/call — invoke a tool
  if (body.method === 'tools/call') {
    const name = body.params?.name
    const args = body.params?.arguments ?? {}

    // openclaw.skills.list
    if (name === 'openclaw.skills.list') {
      const { status, json } = await proxyJson(origin, '/api/skills')
      if (status >= 400) {
        return NextResponse.json(
          rpcErr(id, -32000, 'Upstream /api/skills failed', { status, body: json }),
          { headers: BASE_HEADERS }
        )
      }
      return NextResponse.json(
        ok(id, { content: [{ type: 'text', text: JSON.stringify(json) }], isError: false }),
        { headers: BASE_HEADERS }
      )
    }

    // openclaw.skills.match
    if (name === 'openclaw.skills.match') {
      if (typeof args.task !== 'string' || !args.task.trim()) {
        return NextResponse.json(
          rpcErr(id, -32602, 'Invalid params: task (string) is required'),
          { headers: BASE_HEADERS }
        )
      }
      const { status, json } = await proxyJson(origin, '/api/skills', {
        method: 'POST',
        body: JSON.stringify({ task: args.task }),
      })
      if (status >= 400) {
        return NextResponse.json(
          rpcErr(id, -32000, 'Upstream POST /api/skills failed', { status, body: json }),
          { headers: BASE_HEADERS }
        )
      }
      return NextResponse.json(
        ok(id, { content: [{ type: 'text', text: JSON.stringify(json) }], isError: false }),
        { headers: BASE_HEADERS }
      )
    }

    return NextResponse.json(
      rpcErr(id, -32601, `Unknown tool: ${String(name)}`),
      { status: 404, headers: BASE_HEADERS }
    )
  }

  return NextResponse.json(
    rpcErr(id, -32601, `Method not found: ${body.method}`),
    { status: 404, headers: BASE_HEADERS }
  )
}

/**
 * OPTIONS /api/mcp — CORS preflight
 */
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
