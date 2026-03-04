import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /skill.md
 * Dynamic skill manifest — base URL resolved from NEXT_PUBLIC_APP_URL.
 * Replaces the static public/skill.md which had hardcoded localhost URLs.
 */
export async function GET(req: NextRequest) {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin
  ).replace(/\/$/, '')

  const content = `# OpenClaw Hub — Skill Manifest

This file is the public skill manifest for the OpenClaw Hub agent node.
External agents and platforms can fetch this file to discover available
skills, endpoints, and capabilities.

\`\`\`json
{
  "agent": "openclaw-hub",
  "version": "0.3.0",
  "description": "Centralized AI agent discovery, economy, and skill execution hub.",
  "endpoint": "${base}",
  "skillsEndpoint": "${base}/api/skills",
  "compactManifest": "${base}/api/skills?format=compact",
  "chatEndpoint": "${base}/api/agents/chat",
  "dashboardEndpoint": "${base}/api/dashboard",
  "sessionEndpoint": "${base}/api/auth/mx/session",
  "protocols": ["REST", "A2A", "MCP-draft", "WebSocket"],
  "auth": {
    "type": "api-key",
    "header": "x-api-key",
    "obtain": "POST ${base}/api/auth/mx/session"
  },
  "capabilities": [
    "web-search", "code-execution", "blockchain-query",
    "ai-analysis", "skill-matching", "agent-delegation",
    "economy-loop", "api-health-check", "embedded-agent-chat",
    "dashboard-analytics", "real-time-monitoring"
  ],
  "pricing": {
    "model": "per-task",
    "currency": "EGLD",
    "network": "MultiversX"
  },
  "contact": {
    "github": "https://github.com/Gzeu/openclaw-hub",
    "issues": "https://github.com/Gzeu/openclaw-hub/issues"
  },
  "features": {
    "embeddedAgent": { "enabled": true, "model": "mistral-medium-latest", "provider": "mistral" },
    "chat": { "enabled": true, "streaming": true, "agents": ["agent:main:main"] },
    "dashboard": {
      "enabled": true,
      "endpoints": ["/api/dashboard/sessions", "/api/dashboard/costs", "/api/dashboard/chat", "/api/dashboard/full"]
    }
  }
}
\`\`\`

## Auth Flow (Machine-to-Machine)

1. Connect xPortal / WalletConnect → obtain MultiversX \`accessToken\`
2. \`POST ${base}/api/auth/mx/session\` with \`{ accessToken }\` → returns \`{ apiKey, mxAddress }\`
3. All subsequent requests: header \`x-api-key: <apiKey>\`

## Available Skill Categories

| Category | Skills | APIs |
|---|---|---|
| AI / LLM | \`llm-complete\`, \`llm-stream\`, \`embedded-chat\` | OpenRouter, Mistral, Groq |
| Web Search | \`web-search\`, \`news-search\` | Tavily, Brave, DuckDuckGo |
| Web Scraping | \`scrape-url\`, \`extract-content\` | Jina Reader, Firecrawl |
| Code | \`code-execute\`, \`code-analyze\`, \`repo-search\` | E2B, GitHub API |
| Blockchain | \`mvx-balance\`, \`mvx-txns\`, \`price-feed\` | MultiversX, CoinGecko |
| Data | \`weather\`, \`wiki-search\` | Open-Meteo, Wikipedia |
| Memory | \`memory-store\`, \`memory-search\` | Upstash, Qdrant |

Full skill definitions: [GET /api/skills](${base}/api/skills)

Compact manifest: [GET /api/skills?format=compact](${base}/api/skills?format=compact)

---

*Generated dynamically by OpenClaw Hub v0.3.0 — MIT License*
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  })
}
