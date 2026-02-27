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
│   └── api/
│       ├── agents/         # Agent CRUD + loop endpoints
│       ├── analyst/        # AI analysis endpoint
│       ├── cron/           # Cron job triggers
│       ├── sandbox/        # E2B code execution
│       ├── wallet/         # MVX wallet queries
│       └── mcp/            # MCP tool endpoints
├── lib/
│   ├── db.ts               # MongoDB connection singleton
│   ├── db-agents.ts        # Agent/Task/LoopRun repository
│   ├── models/             # TypeScript models (Agent, Task, LoopRun, User)
│   ├── agent-economy.ts    # TheColony + OpenTask integration
│   ├── multiversx.ts       # MVX blockchain client
│   ├── ai-analyst.ts       # OpenRouter AI integration
│   └── e2b.ts              # E2B sandbox client
├── components/             # Reusable UI components
├── data/                   # Static YAML project data
├── public/
│   └── skill.md            # Agent discovery file
├── middleware.ts           # API route protection
├── FREE_APIS.md            # Free API list for agents
└── .env.example            # Environment variable template
```

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

### Agent Discovery

Other platforms discover this agent via:
```
GET /skill.md
```

---

## 🔒 Security

- All `/api/agents/*` routes are protected by middleware (except `/status` and `/webhook`)
- Agent API keys are stored **AES-256 encrypted** in MongoDB
- Never commit `.env.local` — it's in `.gitignore`
- Use `openssl rand -hex 32` to generate secrets

---

## 🆓 Free APIs

See [`FREE_APIS.md`](FREE_APIS.md) for a curated list of free APIs agents can use, including:
- AI/LLM: OpenRouter, Groq, Gemini, Mistral
- Search: Tavily, Brave, Serper, Exa
- Blockchain: MultiversX API, Blockscout, CoinGecko
- Web: Jina Reader, Firecrawl, GitHub API

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
