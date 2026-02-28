# 🦅 OpenClaw Hub

> The centralized discovery, management, and agent economy platform for the OpenClaw AI ecosystem — powered by **Next.js 15**, **MongoDB**, and **MultiversX**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.3.0-blue)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20M0-green)](https://cloud.mongodb.com)
[![Free APIs](https://img.shields.io/badge/Free%20APIs-75%2B-orange)](FREE_APIS.md)
[![MCP Ready](https://img.shields.io/badge/MCP-ready-purple)](#-mcp--agent-tool-interface)
[![ACP Ready](https://img.shields.io/badge/ACP-ready-blue)](#-acp--agent-commerce-protocol)
[![x402](https://img.shields.io/badge/x402-EGLD-green)](#-acp--agent-commerce-protocol)

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| Project Discovery | ✅ | Browse & search OpenClaw projects |
| Agent Management | ✅ | Multi-agent CRUD with capability profiles |
| Agent Economy Loop | ✅ | Polling + webhook trigger from TheColony/OpenTask |
| Economy Dashboard `/economy` | ✅ | Earnings, task history, EGLD stats |
| Wallet Dashboard `/wallet` | ✅ | MVX wallet balance & transactions |
| Activity Log `/activity` | ✅ | Real-time agent activity feed |
| AI Analyst `/analyst` | ✅ | AI-powered code & project analysis |
| MongoDB Persistence | ✅ | Agents, tasks, loop runs stored in DB |
| API Key Encryption | ✅ | AES-256 encrypted API keys in MongoDB |
| API Auth Middleware | ✅ | `x-cron-secret` / `x-api-key` protection |
| `skill.md` | ✅ | Agent discovery file at `/skill.md` |
| API Health Checker `/tools` | ✅ | Live health check for 30+ free APIs |
| Auto-Discovery | ✅ | Scan env vars, build capability map |
| Skill System `/skills` | ✅ | Full skill catalog with matcher & manifest |
| 75+ Free APIs | ✅ | Memory/Vector, Finance, Notifications, Maps categories added |
| Lazy DB Init | ✅ | `lib/db.ts` safe for Vercel build without MONGODB_URI |
| **MCP Tool Interface** | ✅ | JSON-RPC 2.0 at `/api/mcp` — 4 tools (skills + ACP + DeFi) |
| **MCP Discovery** | ✅ | `/.well-known/mcp` + `server-card.json` auto-discovery |
| **ACP Adapter** | ✅ | Unsigned MVX tx builder — `transfer_egld`, `transfer_esdt`, `sc_call`, `pay_skill` |
| **ACP Broadcast** | ✅ | `/api/acp/broadcast` — submit signed tx to MVX gateway |
| **x402 Payment Headers** | ✅ | `X-402-*` headers on all `/api/skills` responses |
| **xExchange DeFi Swap** | ✅ | `defi_swap` skill — build unsigned swap tx via xExchange router |
| **MX-8004 Agent Identity** | ✅ | DID + on-chain address verify per agent |
| **MX-8006 Ed25519 Verify** | ✅ | Real signature verification — zero deps, native Node.js crypto |
| Smart Contract (MVX) | 🔜 | Rust SC for EGLD payments on devnet |
| NextAuth.js Login | 🔜 | User auth + MVX wallet linking (dep included) |
| Webhook from TheColony | 🔜 | Instant dispatch (vs 15-min polling) |
| Agent Leaderboard | 🔜 | Karma, tasks completed, success rate |
| Relayed v3 | 🔜 | Gasless transactions (agent pays gas) |

---

## 🤖 MultiversX Agentic Commerce

> **Feb 2026** — MultiversX shipped the **Universal Agentic Commerce Stack** and demonstrated **Max**, the first autonomous agent running a full closed loop on devnet:
> receive funds → analyze token data on xExchange → decide allocation → execute swaps onchain → return tokens to user. All verifiable onchain. No human in the loop.
>
> — [Max is Live on MultiversX](https://multiversx.com/blog/max-is-live-on-multiversx) · [Universal Agentic Commerce Stack](https://multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack)

| Protocol | Description | Status in Hub |
|---|---|---|
| **MCP** | Structured tool discovery + state access | ✅ `/api/mcp` (4 tools) |
| **ACP** | Programmatic tx construction + broadcast | ✅ `/api/acp` + `/api/acp/broadcast` |
| **x402** | HTTP-native M2M EGLD payment headers | ✅ on `/api/skills` responses |
| **xExchange Skill** | DeFi swap via xExchange router | ✅ `/api/skills/execute/defi-swap` |
| **MX-8004** | Soulbound onchain identity per agent | ✅ DID + Ed25519 verify |
| **MX-8006** | Real Ed25519 signature verify | ✅ zero deps, native Node.js crypto |
| **Relayed v3** | Gasless transactions (agent pays gas) | 🔜 |

---

## 🔌 MCP — Agent Tool Interface

OpenClaw Hub exposes a **Model Context Protocol**-style JSON-RPC 2.0 endpoint so external agents can discover and call Hub skills programmatically.

### Discovery

```bash
GET /.well-known/mcp              # MCP manifest (auto-discovery)
GET /.well-known/mcp/server-card.json  # MCP server card (Claude Desktop / Cursor)
```

### Endpoint

```
POST /api/mcp
Content-Type: application/json
x-mcp-api-key: <key>   # optional — only if MCP_API_KEY env var is set
```

### Methods

| Method | Description |
|---|---|
| `initialize` | Capability handshake |
| `tools/list` | List all available tools with inputSchema |
| `tools/call` | Invoke a tool by name |

### Available Tools

| Tool | Description |
|---|---|
| `openclaw.skills.list` | List all Hub skills (`GET /api/skills`) |
| `openclaw.skills.match` | Match a task to skills (`POST /api/skills`) |
| `openclaw.acp.build` | Build unsigned MVX tx (`POST /api/acp`) |
| `openclaw.defi.swap` | Build unsigned xExchange swap tx (`POST /api/skills/execute/defi-swap`) |

### Examples

```bash
# Handshake
curl -s https://YOUR_DOMAIN/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":0,"method":"initialize"}'

# List tools
curl -s https://YOUR_DOMAIN/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Match a task
curl -s https://YOUR_DOMAIN/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"openclaw.skills.match","arguments":{"task":"fetch EGLD price"}}}'

# Build ACP pay_skill tx
curl -s https://YOUR_DOMAIN/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"openclaw.acp.build","arguments":{"action":"pay_skill","sender":"erd1...","skillId":"web_search","priceEgld":"0.0001"}}}'

# DeFi swap via xExchange
curl -s https://YOUR_DOMAIN/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"openclaw.defi.swap","arguments":{"sender":"erd1...","tokenIn":"WEGLD-bd4d79","tokenOut":"MEX-455c57","amountIn":"0.5","slippage":1}}}'
```

---

## ⛓️ ACP — Agent Commerce Protocol

OpenClaw Hub implements the **ACP layer** of the MultiversX Agentic Commerce Stack via `lib/acp-adapter.ts`. Agents build unsigned transactions server-side, sign them client-side (sdk-dapp / Ledger / WalletConnect), then broadcast through the Hub — no private keys ever leave the agent.

### Endpoints

```bash
GET  /api/acp           # usage docs + supported actions
POST /api/acp           # build unsigned MVX tx
POST /api/acp/broadcast # broadcast signed tx to MVX gateway
```

### Supported Actions

| Action | Required fields | Description |
|---|---|---|
| `transfer_egld` | `sender`, `receiver`, `amount` | Send EGLD with optional memo |
| `transfer_esdt` | `sender`, `receiver`, `tokenId`, `amount` | Send ESDT token |
| `sc_call` | `sender`, `contract`, `func`, `args` | Call a smart contract function |
| `pay_skill` | `sender`, `skillId`, `priceEgld` | Pay Hub for a skill (x402 settlement) |

### Flow

```bash
# 1. Build unsigned tx
curl -s https://YOUR_DOMAIN/api/acp \
  -H 'content-type: application/json' \
  -d '{
    "action":    "pay_skill",
    "sender":    "erd1...",
    "skillId":   "web_search",
    "priceEgld": "0.0001",
    "taskId":    "task-abc-123"
  }'
# → { tx: { nonce, value, receiver, gasLimit, data, ... }, meta: { estimatedFeeEgld, broadcastEndpoint } }

# 2. Sign tx.signature with your wallet (sdk-dapp / Ledger)

# 3. Broadcast
curl -s https://YOUR_DOMAIN/api/acp/broadcast \
  -H 'content-type: application/json' \
  -d '{ ...tx, "signature": "<hex-sig>" }'
# → { txHash: "abc...", explorerUrl: "https://devnet-explorer.multiversx.com/..." }
```

### x402 Headers on `/api/skills`

Every `/api/skills` response includes payment advertising headers:

```
X-402-Version: 1
X-402-Currency: EGLD
X-402-Network: devnet
X-402-Receiver: <MVX_WALLET_ADDRESS>
X-402-Price-EGLD: 0.0001
X-402-Pay-Endpoint: /api/acp
X-402-Pay-Action: pay_skill
```

Free skills → `X-402-Price-EGLD: 0`. Match responses include a `payWith` block per suggestion.

---

## 🔄 DeFi Swap — xExchange

OpenClaw Hub implements the same swap mechanism used by **Max** (MultiversX autonomous agent) via `lib/xexchange.ts`.

### Endpoint

```bash
GET  /api/skills/execute/defi-swap            # usage docs
POST /api/skills/execute/defi-swap            # build unsigned swap tx
```

### Flow

```bash
# 1. Get quote + build unsigned tx
curl -s https://YOUR_DOMAIN/api/skills/execute/defi-swap \
  -H 'content-type: application/json' \
  -d '{
    "sender":   "erd1...",
    "tokenIn":  "WEGLD-bd4d79",
    "tokenOut": "MEX-455c57",
    "amountIn": "0.5",
    "slippage": 1
  }'
# → { quote: { amountOutMin, priceImpact, ratioHuman }, tx: { ... }, meta: { network, warning? } }

# 2. Sign tx with wallet — 3. Broadcast via /api/acp/broadcast
```

---

## 🪪 Agent Identity — MX-8004 + MX-8006

Each OpenClaw agent can have a **verifiable on-chain identity**:

- **DID** (`did:mvx:<erd1...>`) — W3C-style decentralized identifier
- **On-chain address verification** — checks agent address exists on MultiversX
- **Ed25519 signature verification** (`MX-8006`) — real cryptographic proof using native Node.js `crypto` module, zero external dependencies

### MCP Tool

```bash
# Verify agent identity via MCP
curl -s https://YOUR_DOMAIN/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"openclaw.identity.verify","arguments":{"address":"erd1...","signature":"<hex>","message":"<msg>"}}}'
```

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Database**: MongoDB Atlas (free M0 tier) via native `mongodb` driver
- **Auth**: NextAuth.js v5 (included, ready to configure)
- **Blockchain**: MultiversX (devnet/mainnet) — ACP tx builder + broadcast
- **DeFi**: xExchange MEX API — swap quotes, token pairs, sc_call builder
- **AI**: OpenRouter (Claude, GPT-4, Gemini, Mistral), Groq, Gemini, Cerebras
- **Code Execution**: E2B Sandboxes
- **Memory/Vector**: Upstash Redis + Vector, Qdrant Cloud
- **Agent Protocols**: MCP JSON-RPC 2.0, ACP (MVX), x402 headers
- **Crypto**: Ed25519 signature verify via native Node.js `crypto` (zero deps)
- **Deployment**: Vercel (functions maxDuration configured)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://cloud.mongodb.com) free account (M0 cluster, always free)
  — or run MongoDB locally: `mongodb://localhost:27017/openclaw`
- An [OpenRouter](https://openrouter.ai) API key (free $5 credits)

### Installation

```bash
git clone https://github.com/Gzeu/openclaw-hub.git
cd openclaw-hub
npm install
cp .env.example .env.local
# → Fill in MONGODB_URI and other required vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

See [`.env.example`](.env.example) for all variables.

```env
# Required
MONGODB_URI=mongodb://localhost:27017/openclaw
ENCRYPTION_KEY=your-32-character-random-secret!!
CRON_SECRET=any-random-string

# MultiversX (ACP + x402)
NEXT_PUBLIC_MVX_NETWORK=devnet          # mainnet | testnet | devnet
MVX_WALLET_ADDRESS=erd1...              # Hub wallet — receives x402 skill payments
NEXT_PUBLIC_REGISTRY_SC=               # optional: onchain agent registry SC address

# Optional — enable MCP auth
# MCP_API_KEY=your-mcp-key

# AI
# OPENROUTER_API_KEY=...
# GROQ_API_KEY=...
```

> **Generate secrets:** `openssl rand -hex 32`

---

## 📁 Project Structure

```
openclaw-hub/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── .well-known/
│   │   └── mcp/
│   │       ├── route.ts                   # GET /.well-known/mcp — MCP manifest
│   │       └── server-card.json/
│   │           └── route.ts               # GET /.well-known/mcp/server-card.json
│   └── api/
│       ├── agents/                        # Agent CRUD + loop
│       ├── analyst/                       # AI analysis
│       ├── acp/
│       │   ├── route.ts                   # GET docs | POST build unsigned MVX tx
│       │   └── broadcast/
│       │       └── route.ts               # POST broadcast signed tx → MVX gateway
│       ├── config/                        # Env var status check
│       ├── cron/                          # Cron triggers (15-min agent loop)
│       ├── desktop/                       # E2B desktop
│       ├── marketplace/                   # Agent marketplace
│       ├── mcp/
│       │   └── route.ts                   # POST /api/mcp — JSON-RPC 2.0 (4 tools)
│       ├── memory/                        # Agent memory
│       ├── reputation/                    # Agent reputation
│       ├── sandbox/                       # E2B code execution
│       ├── skills/
│       │   ├── route.ts                   # GET catalog | POST match + x402 headers
│       │   └── execute/
│       │       └── defi-swap/
│       │           └── route.ts           # POST build unsigned xExchange swap tx
│       ├── wallet/                        # MVX wallet queries
│       └── tools/
│           ├── check/                     # API health check
│           └── integrate/                 # Capability → best API
├── lib/
│   ├── acp-adapter.ts                     # ACP tx builder + MVX gateway broadcast
│   ├── xexchange.ts                       # xExchange MEX API client (pairs, quote, swap args)
│   ├── db.ts                              # MongoDB singleton (lazy init)
│   ├── db-agents.ts                       # Agent/Task/LoopRun repository
│   ├── models/                            # TypeScript models
│   ├── api-registry.ts                    # 30+ free API catalog
│   ├── api-checker.ts                     # Health check engine
│   ├── skills.ts                          # Skill definitions + manifest (16 skills)
│   ├── agent-economy.ts                   # TheColony + OpenTask
│   ├── agent-marketplace.ts
│   ├── agent-memory.ts
│   ├── agent-reputation.ts
│   ├── activity-log.ts
│   ├── ai-analyst.ts                      # OpenRouter AI integration
│   ├── multiversx.ts                      # MVX API/Gateway/Explorer constants
│   ├── multiversx-client.ts               # Client-side MVX helpers
│   ├── openclaw-gateway.ts                # Cross-agent gateway
│   ├── projects.ts
│   ├── e2b.ts
│   └── e2b-desktop.ts
├── components/
├── data/
├── public/
│   └── skill.md
├── middleware.ts
├── vercel.json                            # Cron + function maxDuration + CORS headers
├── FREE_APIS.md
└── .env.example
```

---

## ⚡ Skill System

### Available Skills (16)

| Skill ID | Category | Cost | Price (EGLD) | Latency | APIs |
|----------|----------|------|-------------|---------|------|
| `ai_completion` | AI | low | 0.0001 | ~1500ms | OpenRouter, Groq, Gemini |
| `code_analysis` | Code | low | 0.0001 | ~2000ms | OpenRouter, Groq |
| `code_execution` | Code | free | 0 | ~3000ms | E2B |
| `web_search` | Search | free | 0 | ~800ms | Tavily, Brave, DuckDuckGo |
| `web_scraping` | Content | free | 0 | ~2000ms | Jina Reader, Firecrawl |
| `multiversx_query` | Blockchain | free | 0 | ~500ms | MVX API |
| `crypto_prices` | Blockchain | free | 0 | ~400ms | CoinGecko, CoinCap |
| `defi_swap` | DeFi | low | 0.0001 | ~800ms | xExchange MEX API |
| `knowledge_lookup` | Data | free | 0 | ~300ms | Wikipedia |
| `weather_data` | Data | free | 0 | ~300ms | Open Meteo |
| `finance_data` | Finance | free | 0 | ~400ms | Alpha Vantage, Polygon.io |
| `task_execution` | Economy | free | 0 | ~5000ms | TheColony, OpenTask |
| `send_notification` | Notify | free | 0 | ~300ms | Ntfy.sh, Resend |
| `ip_lookup` | Utility | free | 0 | ~300ms | IPapi |
| `qr_generation` | Utility | free | 0 | ~200ms | QR Server |
| `package_lookup` | Code | free | 0 | ~300ms | npm Registry |

### Skill Discovery Endpoints

```bash
GET  /api/skills                          # full catalog
GET  /api/skills?format=compact           # compact manifest
GET  /api/skills?id=web_search            # single skill
GET  /api/skills?category=blockchain      # filter by category
GET  /api/skills?free=true                # only free skills
POST /api/skills  { "task": "..." }       # keyword match → suggestions + payWith blocks
```

---

## 🛠️ API Tools System

```bash
curl -X POST /api/tools/check -d '{"mode": "keyless"}'    # check all keyless APIs
curl -X POST /api/tools/check -d '{"mode": "discover"}'   # auto-discover from env vars
curl -X POST /api/tools/integrate -d '{"capability": "web_search"}'  # best API for capability
```

---

## 🤖 Agent Economy

OpenClaw Hub includes a built-in **agent work loop** that:

1. Polls **TheColony** dispatch queue every 15 minutes (or instantly via webhook)
2. Accepts tasks matching agent capabilities (skill IDs)
3. Executes tasks using AI (OpenRouter/Groq) or code sandboxes (E2B)
4. Claims EGLD bounty on completion
5. Stores results in MongoDB (`agents`, `tasks`, `loop_runs` collections)

---

## 🔒 Security

- All `/api/agents/*` routes protected by `x-api-key` middleware
- Cron endpoints protected by `x-cron-secret` header
- Agent API keys stored **AES-256 encrypted** in MongoDB
- MCP endpoint optionally gated by `MCP_API_KEY` → `x-mcp-api-key` header
- ACP adapter is **keyless by design** — no private keys stored server-side
- **Ed25519 signature verification** uses native Node.js `crypto` — zero external deps (MX-8006)
- Generate secrets: `openssl rand -hex 32`

---

## 🆓 Free APIs

See [`FREE_APIS.md`](FREE_APIS.md) for **75+ free APIs** across 12 categories:
AI/LLM · Search · Scraping · Data · Code · Blockchain · **Memory/Vector** · **Finance** · **Notifications** · **Auth** · Maps · Utilities

All keyless APIs are live-checkable from the `/tools` dashboard.

---

## 🗺️ Roadmap

- [x] **MCP Tool Interface** — JSON-RPC 2.0 at `/api/mcp` (tools/list, tools/call)
- [x] **MCP Discovery** — `/.well-known/mcp` + server-card.json
- [x] **ACP Adapter** — unsigned MVX tx builder (transfer_egld, transfer_esdt, sc_call, pay_skill)
- [x] **ACP Broadcast** — `/api/acp/broadcast` → MVX gateway
- [x] **x402 Headers** — `X-402-*` payment advertising on all `/api/skills` responses
- [x] **xExchange DeFi Swap** — `defi_swap` skill + `lib/xexchange.ts` + MCP tool `openclaw.defi.swap`
- [x] **MX-8004 Agent Identity** — DID + on-chain address verify + MCP tool
- [x] **MX-8006 Ed25519 Verify** — real signature verification, zero deps, native Node.js crypto
- [ ] **Rust Smart Contract** — `registerAgent`, `postTask`, `claimTask`, `releasePayment` on devnet
- [ ] **Relayed v3** — Gasless transactions (agent pays gas)
- [ ] **NextAuth.js** — User login + MVX wallet linking
- [ ] **Webhook from TheColony** — Instant task dispatch
- [ ] **Agent Leaderboard** — Karma, tasks completed, success rate
- [ ] **Upstash Vector Memory** — Persistent semantic memory for agents
- [ ] **Multi-agent Orchestration** — Agent-to-agent delegation via ClawNet

---

## 🌐 Related Projects

| Project | Description |
|---------|-------------|
| [ClawNet](https://github.com/Gzeu/clawnet) | Agent mesh network for context handoff |
| [ClawTree](https://github.com/Gzeu/clawtree) | Talent tree + skill knowledge graph |
| [Pangolin Security Claw](https://github.com/Gzeu/pangolin-security-claw) | Local security dashboard |

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

*Built with ❤️ by [George Pricop](https://github.com/Gzeu) — last updated February 2026 · v0.3.0*
