import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const headers = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'public, max-age=3600',
  'Access-Control-Allow-Origin': '*',
}

/**
 * MCP Discovery Manifest
 * Agents / MCP clients can GET /.well-known/mcp to discover this server's capabilities.
 * Pattern follows: https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide
 */
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin
  const hasKey = Boolean(process.env.MCP_API_KEY?.trim())

  return NextResponse.json(
    {
      mcp_version: '2025-11-25',
      endpoints: [
        {
          url: `${origin}/api/mcp`,
          transport: 'http-jsonrpc',
          capabilities: ['tools'],
          auth: hasKey
            ? { type: 'api-key', header: 'x-mcp-api-key' }
            : { type: 'none' },
        },
      ],
      links: {
        skills:        `${origin}/api/skills`,
        skillManifest: `${origin}/skill.md`,
        serverCard:    `${origin}/.well-known/mcp/server-card.json`,
        faq:           `${origin}/qa`,
      },
      serverInfo: { name: 'openclaw-hub', version: '0.2.0' },
    },
    { headers }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...headers,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, x-mcp-api-key',
    },
  })
}
