import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const headers = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'public, max-age=3600',
  'Access-Control-Allow-Origin': '*',
}

/**
 * MCP Server Card
 * Machine-readable description of this server for MCP client auto-configuration.
 * Some clients (Claude Desktop, Cursor, etc.) look for this at /.well-known/mcp/server-card.json
 */
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin

  return NextResponse.json(
    {
      $schema: 'https://modelcontextprotocol.io/schemas/server-card/v1.0',
      version: '1.0',
      protocolVersion: '2025-11-25',
      serverInfo: {
        name:        'OpenClaw Hub',
        version:     '0.2.0',
        description: 'MCP-style tool access to OpenClaw Hub skills — MultiversX agentic commerce compatible.',
        homepage:    origin,
      },
      transport: {
        type: 'streamable-http',
        url:  `${origin}/api/mcp`,
      },
      capabilities: {
        tools:     true,
        resources: false,
        prompts:   false,
      },
      tools: [
        {
          name:        'openclaw.skills.list',
          description: 'List all skills exposed by this Hub.',
        },
        {
          name:        'openclaw.skills.match',
          description: 'Match a natural-language task to relevant skills.',
        },
      ],
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
