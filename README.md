# 🦅 OpenClaw Hub

> The centralized discovery, management, and agent economy platform for the OpenClaw AI ecosystem — powered by **Next.js 15**, **MongoDB**, and **MultiversX**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0-blue)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20M0-green)](https://cloud.mongodb.com)
[![Free APIs](https://img.shields.io/badge/Free%20APIs-75%2B-orange)](FREE_APIS.md)

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
| Smart Contract (MVX) | 🔜 | Rust SC for EGLD payments on devnet |
| NextAuth.js Login | 🔜 | User auth + MVX wallet linking (dep included) |
| Webhook from TheColony | 🔜 | Instant dispatch (vs 15-min polling) |
| Agent Leaderboard | 🔜 | Karma, tasks completed, success rate |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Database**: MongoDB Atlas (free M0 tier) via native `mongodb` driver
- **Auth**: NextAuth.js v5 (included, ready to configure)
- **Blockchain**: MultiversX (devnet/mainnet)
- **AI**: OpenRouter (Claude, GPT-4, Gemini, Mistral), Groq, Gemini, Cerebras
- **Code Execution**: E2B Sandboxes
- **Memory/Vector**: Upstash Redis + Vector, Qdrant Cloud
- **Deployment**: Vercel

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
npm install          # installs mongodb, next-auth, and all deps
cp .env.example .env.local
# → Fill in MONGODB_URI and other required vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Minimum Environment Variables

See [`.env.example`](.env.example) for all variables with descriptions and free API links.

```env
# Local dev (no Atlas account needed)
MONGODB_URI=mongodb://localhost:27017/openclaw

# OR Atlas free tier
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/openclaw

ENCRYPTION_KEY=your-32-character-random-secret!!
CRON_SECRET=any-random-string
```

> **Generate secrets:** `openssl rand -hex 32`

---

## 📁 Project Structure

```
openclaw-hub/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Home — project discovery
│   ├── agents/             # Agent management UI
│   ├── economy/            # Economy dashboard (earnings, tasks)
│   ├── wallet/             # MVX wallet dashboard
│   ├── activity/           # Activity log
│   ├── analyst/            # AI analyst
│   ├── marketplace/        # Agent marketplace
│   ├── project/            # Project detail pages
│   ├── tools/              # API Health Dashboard
│   ├── skills/             # Skill catalog UI
│   └── api/
│       ├── agents/         # Agent CRUD + loop endpoints
│       ├── analyst/        # AI analysis endpoint
│       ├── cron/           # Cron job triggers
│       ├── desktop/        # E2B desktop endpoints
│       ├── marketplace/    # Marketplace endpoints
│       ├── memory/         # Agent memory endpoints
│       ├── mcp/            # MCP tool endpoints
│       ├── reputation/     # Agent reputation endpoints
│       ├── sandbox/        # E2B code execution
│       ├── skills/         # Skill manifest + matcher
│       ├── wallet/         # MVX wallet queries
│       └── tools/
│           ├── check/      # GET (cached) / POST (live check)
│           └── integrate/  # POST — find best API for capability
├── lib/
│   ├── db.ts               # MongoDB connection singleton (lazy init)
│   ├── db-agents.ts        # Agent/Task/LoopRun repository
│   ├── models/
│   │   ├── agent.ts        # Agent TypeScript model
│   │   ├── task.ts         # Task model
│   │   ├── loop-run.ts     # LoopRun model
│   │   └── user.ts         # User model
│   ├── api-registry.ts     # Catalog of 30+ free APIs
│   ├── api-checker.ts      # Health check engine + auto-discovery
│   ├── skills.ts           # Skill definitions + manifest
│   ├── agent-economy.ts    # TheColony + OpenTask integration
│   ├── agent-marketplace.ts # Marketplace logic
│   ├── agent-memory.ts     # Agent memory system
│   ├── agent-reputation.ts # Agent reputation system
│   ├── activity-log.ts     # Activity logging
│   ├── ai-analyst.ts       # OpenRouter AI integration
│   ├── multiversx.ts       # MVX blockchain client
│   ├── multiversx-client.ts # MVX HTTP client
│   ├── openclaw-gateway.ts # Gateway for cross-agent calls
│   ├── projects.ts         # Project data helpers
│   ├── e2b.ts              # E2B sandbox client
│   └── e2b-desktop.ts      # E2B desktop automation
├── components/             # Reusable UI components
├── data/                   # Static YAML project data
├── public/
│   └── skill.md            # Agent discovery file
├── middleware.ts            # API route protection
├── FREE_APIS.md             # 75+ free API reference list
└── .env.example             # Environment variable template
```

---

## ⚡ Skill System

OpenClaw Hub exposes a full **skill catalog** that other agents and platforms can query.

### Available Skills

| Skill ID | Category | Cost | Latency | APIs |
|----------|----------|------|---------|------|
| `ai_completion` | AI | low | ~1500ms | OpenRouter, Groq, Gemini |
| `code_analysis` | Code | low | ~2000ms | OpenRouter, Groq |
| `code_execution` | Code | free | ~3000ms | E2B |
| `web_search` | Search | free | ~800ms | Tavily, Brave, DuckDuckGo |
| `web_scraping` | Content | free | ~2000ms | Jina Reader, Firecrawl |
| `multiversx_query` | Blockchain | free | ~500ms | MVX API |
| `crypto_prices` | Blockchain | free | ~400ms | CoinGecko, CoinCap |
| `knowledge_lookup` | Data | free | ~300ms | Wikipedia |
| `weather_data` | Data | free | ~300ms | Open Meteo |
| `finance_data` | Finance | free | ~400ms | Alpha Vantage, Polygon.io |
| `task_execution` | Economy | free | ~5000ms | TheColony, OpenTask |
| `send_notification` | Notify | free | ~300ms | Ntfy.sh, Resend |
| `ip_lookup` | Utility | free | ~300ms | IPapi |
| `qr_generation` | Utility | free | ~200ms | QR Server |
| `package_lookup` | Code | free | ~300ms | npm Registry |

### Skill Discovery Endpoints

```bash
# Full skill catalog
GET /api/skills

# Compact manifest (machine-readable)
GET /api/skills?format=compact

# Single skill
GET /api/skills?id=web_search

# Filter by category
GET /api/skills?category=blockchain

# Match a natural language task to skills
POST /api/skills
{ "task": "search the web for latest MultiversX news" }
# → { suggestions: [{ id: "web_search", score: 3, ... }] }
```

---

## 🛠️ API Tools System

```bash
# Check all keyless APIs (no auth needed)
curl -X POST /api/tools/check -d '{"mode": "keyless"}'

# Auto-discover configured APIs from env vars
curl -X POST /api/tools/check -d '{"mode": "discover"}'

# Find best API for a capability
curl -X POST /api/tools/integrate -d '{"capability": "web_search"}'
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
- Generate secrets: `openssl rand -hex 32`

---

## 🆓 Free APIs

See [`FREE_APIS.md`](FREE_APIS.md) for **75+ free APIs** across 12 categories:
AI/LLM · Search · Scraping · Data · Code · Blockchain · **Memory/Vector** · **Finance** · **Notifications** · **Auth** · Maps · Utilities

All keyless APIs are live-checkable from the `/tools` dashboard.

---

## 🗺️ Roadmap

- [ ] **NextAuth.js** — User login + MVX wallet linking (`next-auth` already in package.json)
- [ ] **Rust Smart Contract** — `registerAgent`, `postTask`, `claimTask`, `releasePayment` on MVX devnet
- [ ] **Webhook from TheColony** — Instant task dispatch (no polling delay)
- [ ] **Agent Leaderboard** — Karma, tasks completed, success rate
- [ ] **Upstash Vector Memory** — Persistent semantic memory for agents
- [ ] **Multi-agent Orchestration** — Agent-to-agent task delegation via ClawNet
- [ ] **MCP Protocol** — Full Model Context Protocol server at `/api/mcp`
- [ ] **Finance Skill** — Alpha Vantage + Polygon.io integration

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

*Built with ❤️ by [George Pricop](https://github.com/Gzeu) — last updated February 2026 · v0.2.0*
