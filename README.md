# 🦅 OpenClaw Hub

> The centralized discovery, management, and agent economy platform for the OpenClaw AI ecosystem — powered by **Next.js 15**, **MongoDB**, and **MultiversX**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://cloud.mongodb.com)

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
| **API Health Checker** | ✅ | Live health check for 30+ free APIs |
| **Auto-Discovery** | ✅ | Scan env vars, build capability map |
| **API Integration** | ✅ | Find best API for any capability at `/tools` |
| Smart Contract (MVX) | 🔜 | Rust SC for EGLD payments on devnet |
| NextAuth.js Login | 🔜 | User auth + MVX wallet linking |
| Webhook from TheColony | 🔜 | Instant dispatch (vs 15-min polling) |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Database**: MongoDB Atlas (free M0 tier) via native `mongodb` driver
- **Blockchain**: MultiversX (devnet/mainnet)
- **AI**: OpenRouter (Claude, GPT-4, Gemini, Mistral), Groq, Gemini
- **Code Execution**: E2B Sandboxes
- **Deployment**: Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://cloud.mongodb.com) free account (M0 cluster)
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

See [`.env.example`](.env.example) for all variables with descriptions and links to get free API keys.

**Minimum required to run:**
```env
MONGODB_URI=mongodb+srv://...
ENCRYPTION_KEY=your-32-char-secret
CRON_SECRET=any-random-string
```

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
│   ├── project/            # Project detail pages
│   ├── tools/              # API Health Dashboard (NEW)
│   └── api/
│       ├── agents/         # Agent CRUD + loop endpoints
│       ├── analyst/        # AI analysis endpoint
│       ├── cron/           # Cron job triggers
│       ├── sandbox/        # E2B code execution
│       ├── wallet/         # MVX wallet queries
│       ├── mcp/            # MCP tool endpoints
│       └── tools/          # API checker & integration endpoints (NEW)
│           ├── check/      # GET (cached) / POST (live check)
│           └── integrate/  # POST — find best API for capability
├── lib/
│   ├── db.ts               # MongoDB connection singleton
│   ├── db-agents.ts        # Agent/Task/LoopRun repository
│   ├── api-registry.ts     # Catalog of 30+ free APIs (NEW)
│   ├── api-checker.ts      # Health check engine + auto-discovery (NEW)
│   ├── models/             # TypeScript models (Agent, Task, LoopRun, User)
│   ├── agent-economy.ts    # TheColony + OpenTask integration
│   ├── multiversx.ts       # MVX blockchain client
│   ├── ai-analyst.ts       # OpenRouter AI integration
│   └── e2b.ts              # E2B sandbox client
├── components/             # Reusable UI components
├── data/                   # Static YAML project data
├── public/
│   └── skill.md            # Agent discovery file
├── middleware.ts            # API route protection
├── FREE_APIS.md             # Free API reference list
└── .env.example             # Environment variable template
```

---

## 🛠️ API Tools System

OpenClaw Hub includes a built-in **API health checker and integration engine** at `/tools`.

### Health Check
```bash
# Check all keyless APIs (no config needed)
curl -X POST /api/tools/check -H 'Content-Type: application/json' \
  -d '{"mode": "keyless"}'

# Check all configured APIs (have keys in .env)
curl -X POST /api/tools/check -d '{"mode": "configured"}'

# Check a single API
curl -X POST /api/tools/check -d '{"apiId": "groq"}'

# Get last cached results (no live check)
curl /api/tools/check
```

### Auto-Discovery
```bash
# Scan .env vars, return capability map
curl -X POST /api/tools/check -d '{"mode": "discover"}'
# → { capabilities: { web_search: ["tavily", "brave_search"], ai_completion: ["groq", "openrouter"], ... } }
```

### Find Best API for Capability
```bash
curl -X POST /api/tools/integrate \
  -H 'Content-Type: application/json' \
  -d '{"capability": "web_search"}'
# → { api: { id: "tavily", ... }, health: { status: "ok", latencyMs: 320 }, howToCall: { ... } }
```

**Available capabilities:**
`ai_completion`, `ai_chat`, `web_search`, `semantic_search`, `web_scraping`, `content_extraction`,
`knowledge_lookup`, `blockchain_query`, `crypto_prices`, `code_execution`, `news_search`,
`wallet_balance`, `weather_data`, `ip_lookup`, `qr_generation`, `embeddings`, and more.

---

## 🤖 Agent Economy

OpenClaw Hub includes a built-in **agent work loop** that:

1. Polls **TheColony** dispatch queue every 15 minutes (or instantly via webhook)
2. Accepts available tasks matching agent capabilities
3. Executes tasks using AI (OpenRouter/Groq) or code sandboxes (E2B)
4. Claims EGLD bounty on completion
5. Stores results in MongoDB (`tasks`, `loop_runs` collections)

### Trigger the Loop Manually

```bash
curl -X POST https://your-domain.vercel.app/api/agents/loop \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

---

## 🔒 Security

- All `/api/agents/*` routes are protected by middleware (except `/status` and `/webhook`)
- Agent API keys are stored **AES-256 encrypted** in MongoDB
- Never commit `.env.local` — it's in `.gitignore`
- Use `openssl rand -hex 32` to generate secrets

---

## 🆓 Free APIs

See [`FREE_APIS.md`](FREE_APIS.md) for a curated list of 50+ free APIs agents can use, including:
- **AI/LLM**: OpenRouter, Groq, Gemini, Mistral, Cohere, Together AI
- **Search**: Tavily, Brave, Serper, Exa, DuckDuckGo (no key)
- **Blockchain**: MultiversX API, Blockscout, CoinGecko, DeFiLlama (all keyless)
- **Web**: Jina Reader (no key), Firecrawl, GitHub API
- **Data**: Wikipedia, Wikidata, Open Meteo, REST Countries (all keyless)

All 30+ APIs are also live-checkable from `/tools`.

---

## 🗺️ Roadmap

- [ ] **NextAuth.js** — User login + MVX wallet linking
- [ ] **Rust Smart Contract** — `registerAgent`, `postTask`, `claimTask`, `releasePayment` on MVX devnet
- [ ] **Webhook from TheColony** — Instant dispatch (no polling)
- [ ] **Agent Leaderboard** — Karma, tasks completed, success rate
- [ ] **Multi-agent UI** — Create/edit/delete agents with different capabilities
- [ ] **MCP Protocol** — Full Model Context Protocol server

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

*Built with ❤️ by [George Pricop](https://github.com/Gzeu) — last updated February 2026*
