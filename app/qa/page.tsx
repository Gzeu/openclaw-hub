'use client'

import { useState, useMemo, useCallback } from 'react'

interface QAItem {
  id: string
  category: string
  q: string
  a: string | React.ReactNode
  tags: string[]
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const QA: QAItem[] = [
  // General
  {
    id: 'g1', category: 'General',
    q: 'What is OpenClaw Hub?',
    a: 'OpenClaw Hub is the central dashboard for the OpenClaw AI agent ecosystem. It lets you browse GitHub projects, manage multi-agent sessions, discover and invoke skills, run isolated code via E2B sandboxes, monitor 75+ free APIs, and earn rewards through TheColony / OpenTask — all with MultiversX (EGLD) payments baked in.',
    tags: ['intro', 'platform', 'overview'],
  },
  {
    id: 'g2', category: 'General',
    q: 'What is the tech stack?',
    a: 'Next.js 15 (App Router) · TypeScript 5 · Tailwind CSS 3 · MongoDB Atlas (native driver, no Mongoose) · MultiversX blockchain · OpenRouter / Groq / Gemini for LLMs · E2B for isolated code execution · Vercel for hosting and cron jobs.',
    tags: ['tech', 'stack', 'nextjs', 'mongodb', 'vercel'],
  },
  {
    id: 'g3', category: 'General',
    q: 'Is the project open source?',
    a: 'Yes. OpenClaw Hub is MIT-licensed. Source code lives at github.com/Gzeu/openclaw-hub. Contributions via Pull Request are welcome — fork, branch off main, and open a PR.',
    tags: ['open-source', 'mit', 'github', 'contributing'],
  },
  {
    id: 'g4', category: 'General',
    q: 'What pages does the app have?',
    a: '/ (project discovery) · /agents (multi-agent chat & delegation) · /economy (task dispatch, earnings, cron loop) · /marketplace (buy & sell skills) · /wallet (MultiversX wallet) · /activity (live activity feed) · /analyst (AI code analysis) · /skills (skill catalog & matcher) · /tools (API health dashboard) · /qa (this page).',
    tags: ['pages', 'routes', 'navigation'],
  },
  {
    id: 'g5', category: 'General',
    q: 'How does the project relate to the broader OpenClaw ecosystem?',
    a: 'OpenClaw Hub is the web frontend / control plane. Related repos: ClawNet (agent mesh network for context handoff across agents), ClawTree (talent tree + skill knowledge graph), and Pangolin Security Claw (local security dashboard). All share the same skill registry format.',
    tags: ['ecosystem', 'clawnet', 'clawtree', 'pangolin'],
  },

  // Setup
  {
    id: 's1', category: 'Setup',
    q: 'What environment variables are required to run the app?',
    a: 'The absolute minimum: MONGODB_URI (e.g. mongodb://localhost:27017/openclaw or a MongoDB Atlas connection string), ENCRYPTION_KEY (exactly 32 hex chars — used for AES-256 encryption of agent API keys), and CRON_SECRET (any random string to protect /api/cron/* routes). Without MONGODB_URI the app boots but every DB route throws at runtime.',
    tags: ['env', 'config', 'mongodb', 'encryption'],
  },
  {
    id: 's2', category: 'Setup',
    q: 'How do I run the project locally?',
    a: 'git clone https://github.com/Gzeu/openclaw-hub.git && cd openclaw-hub && npm install && cp .env.example .env.local — then fill in MONGODB_URI and the other keys in .env.local, and run npm run dev. The app is available at http://localhost:3000.',
    tags: ['local', 'dev', 'install', 'clone'],
  },
  {
    id: 's3', category: 'Setup',
    q: 'Why MongoDB? Can I use a different database?',
    a: 'MongoDB Atlas M0 is permanently free and zero-config. The project uses the native mongodb driver (not Mongoose) for maximum performance and minimal overhead. Switching to Postgres or SQLite would require rewriting lib/db-agents.ts and all collection queries — doable, but not supported out of the box.',
    tags: ['mongodb', 'database', 'atlas', 'postgres'],
  },
  {
    id: 's4', category: 'Setup',
    q: 'How do I generate ENCRYPTION_KEY?',
    a: 'Run in your terminal: openssl rand -hex 32. This outputs a 64-character string representing 32 bytes — paste it as ENCRYPTION_KEY in .env.local and in Vercel Environment Variables. Never commit it to git or expose it publicly.',
    tags: ['security', 'encryption', 'openssl', 'env'],
  },
  {
    id: 's5', category: 'Setup',
    q: 'Which optional API keys give the most immediate value?',
    a: 'OPENROUTER_API_KEY (or GROQ_API_KEY) unlocks the agent chat, analyst, and economy loop. E2B_API_KEY enables the code sandbox in /agents. COLONY_AGENT_API_KEY activates the economy loop task fetching. Everything else (Tavily, Brave, CoinGecko, etc.) progressively enhances individual skills.',
    tags: ['api-keys', 'openrouter', 'e2b', 'groq', 'priority'],
  },

  // Agents
  {
    id: 'a1', category: 'Agents',
    q: 'How does the agent system work?',
    a: 'Agents are stored in MongoDB with a unique session key, a human-readable label, a list of capability (skill) IDs, and an AES-256 encrypted API key. The /agents page renders a 3-panel layout: agent list on the left, streaming chat in the center, and an E2B code sandbox + A2A delegation panel on the right.',
    tags: ['agents', 'mongodb', 'session', 'capabilities'],
  },
  {
    id: 'a2', category: 'Agents',
    q: 'What is A2A (Agent-to-Agent) delegation?',
    a: 'The Delegate panel in /agents lets one agent forward a task to any other registered agent. The source agent sends the task description and current sandbox context to /api/agents/delegate. The target agent processes it using its own LLM configuration and returns the result — enabling multi-agent pipelines without a central orchestrator.',
    tags: ['a2a', 'delegation', 'multi-agent', 'pipeline'],
  },
  {
    id: 'a3', category: 'Agents',
    q: 'Does chat use streaming?',
    a: 'Yes. POST /api/agents/chat returns a ReadableStream (SSE-style). The client reads chunks with getReader() and appends tokens to the UI incrementally. The backend model is selected based on available keys: OPENROUTER_API_KEY → OpenRouter, GROQ_API_KEY → Groq, GEMINI_API_KEY → Gemini Flash.',
    tags: ['chat', 'streaming', 'sse', 'openrouter', 'groq'],
  },
  {
    id: 'a4', category: 'Agents',
    q: 'How are agent API routes protected?',
    a: 'middleware.ts intercepts all requests to /api/agents/* and requires a valid x-api-key header. Cron routes at /api/cron/* require x-cron-secret. Both values are validated against ENCRYPTION_KEY and CRON_SECRET in the environment. Unauthorized requests receive a 401 before reaching any handler.',
    tags: ['security', 'middleware', 'auth', 'api-key'],
  },
  {
    id: 'a5', category: 'Agents',
    q: 'What does the E2B sandbox do?',
    a: 'E2B provides an isolated cloud VM (Python/Node) where agents can execute arbitrary code safely. In /agents, you write code in the sandbox panel, the agent reviews it via chat, and execution results (stdout, errors, files) are streamed back. Requires E2B_API_KEY.',
    tags: ['e2b', 'sandbox', 'code-execution', 'isolation'],
  },

  // Economy
  {
    id: 'e1', category: 'Economy',
    q: 'How does the Agent Economy Loop work?',
    a: 'A Vercel Cron job fires every 15 minutes at /api/cron/agent-loop. It: (1) fetches available dispatches from TheColony, (2) falls back to Moltverr if none found, (3) selects the best matching skill, (4) executes the task in an E2B sandbox, (5) generates a structured report via OpenRouter, (6) delivers the result to the platform, (7) logs everything to MongoDB.',
    tags: ['economy', 'cron', 'loop', 'automation', 'thecolony'],
  },
  {
    id: 'e2', category: 'Economy',
    q: 'Which task platforms are supported?',
    a: 'TheColony (karma + sats rewards) · Moltverr (USD / crypto) · OpenTask (USD $5–$400 per task) · ugig.net (SOL / ETH / USDC). Each platform has an adapter in lib/agent-economy.ts that normalizes task schema, reward structure, and delivery format into a common interface.',
    tags: ['platforms', 'thecolony', 'opentask', 'moltverr', 'ugig'],
  },
  {
    id: 'e3', category: 'Economy',
    q: 'How do I configure my Colony API key?',
    a: 'Add COLONY_AGENT_API_KEY to .env.local and to Vercel Environment Variables for production. In the /economy UI you can also store it in localStorage under the key colony_api_key for quick manual testing without restarting the dev server.',
    tags: ['colony', 'api-key', 'config', 'env'],
  },
  {
    id: 'e4', category: 'Economy',
    q: 'Can I trigger the economy loop manually?',
    a: 'Yes. In the /economy page, the "Run Loop Now" button fires POST /api/cron/agent-loop directly from the browser (with the CRON_SECRET handled server-side). You can also call the endpoint via curl: curl -X POST https://your-domain/api/cron/agent-loop -H "x-cron-secret: YOUR_CRON_SECRET".',
    tags: ['economy', 'manual', 'curl', 'trigger'],
  },

  // Blockchain
  {
    id: 'b1', category: 'Blockchain',
    q: 'Which MultiversX network does the project use by default?',
    a: 'Devnet (https://devnet-api.multiversx.com). To switch to mainnet set MVX_NETWORK=mainnet and MVX_API_URL=https://api.multiversx.com in .env. The EGLD payment smart contract is in the roadmap (Rust SC on devnet first, then mainnet after audit).',
    tags: ['multiversx', 'devnet', 'mainnet', 'egld', 'network'],
  },
  {
    id: 'b2', category: 'Blockchain',
    q: 'How do I connect a MultiversX wallet?',
    a: 'Set MVX_WALLET_ADDRESS in .env to see balance and transactions on /wallet. Full xPortal / Web Wallet connect is in the roadmap via MvxConnectButton (already scaffolded in /components). Once connected, agents will be able to sign transactions for EGLD reward collection automatically.',
    tags: ['wallet', 'xportal', 'mvx', 'connect'],
  },

  // Skills & APIs
  {
    id: 'sk1', category: 'Skills & APIs',
    q: 'What is the Skill system?',
    a: 'Skills are structured, typed capabilities that agents expose to the outside world. Each skill defines: a unique ID, human description, category, typed inputs and outputs, the list of underlying APIs used, an example call, cost estimate, average latency, and which agent types support it. External platforms discover skills via GET /api/skills.',
    tags: ['skills', 'api', 'discovery', 'capabilities'],
  },
  {
    id: 'sk2', category: 'Skills & APIs',
    q: 'How does the Skill Matcher work?',
    a: 'POST /api/skills with body { "task": "your description" } returns a ranked list of skills that match the task. Matching is keyword-based across skill descriptions, IDs, and API names — scoring each skill and sorting by relevance. The /skills page exposes this as an interactive search UI.',
    tags: ['skill-matcher', 'ranking', 'nlp', 'search'],
  },
  {
    id: 'sk3', category: 'Skills & APIs',
    q: 'What free APIs are available?',
    a: '75+ free APIs across 12 categories: AI/LLM (OpenRouter, Groq, Gemini Flash), Search (Tavily, Brave Search, DuckDuckGo), Web Scraping (Jina Reader, Firecrawl), Data (Wikipedia, Open-Meteo), Code (GitHub API, npm registry, E2B), Blockchain (MultiversX, CoinGecko, DeFiLlama), Vector/Memory (Upstash, Qdrant), Finance (Alpha Vantage), Notifications (Resend, ntfy.sh), Auth (Auth0), Maps (OpenStreetMap), Utilities. Full list in FREE_APIS.md.',
    tags: ['free-apis', 'catalog', 'coingecko', 'tavily', 'jina'],
  },
  {
    id: 'sk4', category: 'Skills & APIs',
    q: 'How do I check if an API is working?',
    a: 'Go to /tools and click "Run Health Check" with mode set to "Keyless only". The checker pings each API live, measures latency, and records HTTP status. Results are cached in MongoDB for 15 minutes to avoid hammering rate limits. The stats bar at the top shows online / degraded / error / unconfigured counts at a glance.',
    tags: ['health-check', 'tools', 'monitoring', 'latency'],
  },
  {
    id: 'sk5', category: 'Skills & APIs',
    q: 'What is the Compact Manifest format?',
    a: 'GET /api/skills?format=compact returns a lightweight JSON object (typically < 2 KB) listing all skills with only the fields needed for another agent to decide whether to delegate: id, name, endpoint, costEstimate, and avgLatencyMs. This is meant to be injected directly into an agent\'s system prompt or tool-discovery call.',
    tags: ['manifest', 'compact', 'a2a', 'agent', 'discovery'],
  },

  // Deployment
  {
    id: 'd1', category: 'Deployment',
    q: 'How do I deploy to Vercel?',
    a: 'Import the repo in Vercel, add environment variables (MONGODB_URI, ENCRYPTION_KEY, CRON_SECRET, OPENROUTER_API_KEY at minimum), and click Deploy. Vercel auto-detects Next.js 15. For cron jobs, make sure vercel.json includes the crons array pointing to /api/cron/agent-loop.',
    tags: ['vercel', 'deploy', 'production', 'env'],
  },
  {
    id: 'd2', category: 'Deployment',
    q: 'How do I configure Vercel Cron for the agent loop?',
    a: 'In vercel.json add: { "crons": [{ "path": "/api/cron/agent-loop", "schedule": "*/15 * * * *" }] }. Vercel automatically sends CRON_SECRET as the Authorization header on every invocation. Cron jobs are available on Pro plans; on Hobby, you can trigger manually or use an external scheduler (e.g. GitHub Actions workflow_dispatch).',
    tags: ['cron', 'vercel', 'schedule', 'automation'],
  },
  {
    id: 'd3', category: 'Deployment',
    q: 'Why does lib/db.ts use lazy initialization?',
    a: 'Vercel runs static analysis and tree-shaking at build time. If MONGODB_URI is missing and the module throws at the top level, the entire build fails — even for pages that never touch the DB. Lazy init (connecting only when a DB function is first called) means the error surfaces at request time with a clear 500 message, not at deploy time with a cryptic build error.',
    tags: ['mongodb', 'lazy-init', 'build', 'vercel', 'error-handling'],
  },

  // Roadmap
  {
    id: 'r1', category: 'Roadmap',
    q: 'What is coming next?',
    a: 'Highest priority items: (1) NextAuth.js authentication + MultiversX wallet linking (next-auth already in package.json), (2) Rust Smart Contract on MVX devnet for on-chain EGLD reward distribution, (3) Real-time TheColony webhooks (replacing 15-min polling), (4) Agent Leaderboard with karma / earnings stats, (5) Upstash Vector Memory for long-term agent context, (6) Full MCP (Model Context Protocol) server implementation.',
    tags: ['roadmap', 'nextauth', 'smart-contract', 'mcp', 'vector-memory'],
  },
  {
    id: 'r2', category: 'Roadmap',
    q: 'Can I contribute a new skill or API adapter?',
    a: 'Yes. To add a skill: extend the SKILLS array in lib/skills.ts with the typed SkillDef object. To add a free API: add an entry to FREE_APIS.md and create a health-check adapter in lib/api-checker.ts following the existing pattern. Then open a PR — all new skills are auto-discovered by the skill matcher with no additional config.',
    tags: ['contributing', 'skills', 'api-adapter', 'pr', 'open-source'],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', ...Array.from(new Set(QA.map(q => q.category)))]

const CAT_ICONS: Record<string, string> = {
  General:       '💡',
  Setup:         '⚙️',
  Agents:        '🤖',
  Economy:       '💸',
  Blockchain:    '🔗',
  'Skills & APIs': '⚡',
  Deployment:    '🚀',
  Roadmap:       '🗺️',
}

function highlight(text: string, term: string) {
  if (!term.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase()
          ? <mark key={i} style={{ background: 'rgba(167,139,250,0.25)', color: '#c4b5fd', borderRadius: '3px', padding: '0 1px' }}>{p}</mark>
          : p
      )}
    </>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QAPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [category, setCategory] = useState('All')
  const [search,   setSearch]   = useState('')

  const toggle = useCallback((id: string) => {
    setExpanded(prev => (prev === id ? null : id))
  }, [])

  const filtered = useMemo(() => QA.filter(item => {
    const catOk    = category === 'All' || item.category === category
    const s        = search.toLowerCase()
    const searchOk = !s
      || item.q.toLowerCase().includes(s)
      || (typeof item.a === 'string' && item.a.toLowerCase().includes(s))
      || item.tags.some(t => t.includes(s))
    return catOk && searchOk
  }), [category, search])

  const grouped = useMemo(() => {
    const map: Record<string, QAItem[]> = {}
    filtered.forEach(item => {
      ;(map[item.category] ??= []).push(item)
    })
    return map
  }, [filtered])

  return (
    <div className="min-h-screen">
      <div className="max-w-[820px] mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💬</span>
            <h1 className="text-3xl font-black text-white">FAQ</h1>
            <span className="badge badge-accent">{QA.length} questions</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Everything you need to know about OpenClaw Hub — setup, agents, economy, blockchain, and deployment.
          </p>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-5 animate-fade-up" style={{ animationDelay: '0.06s' }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: 'var(--text-dim)' }}>🔍</span>
          <input
            className="input"
            style={{ paddingLeft: '2rem' }}
            placeholder="Search questions, answers, or tags…"
            value={search}
            onChange={e => { setSearch(e.target.value); setExpanded(null) }}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--text-dim)' }}
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Result count ── */}
        {search && (
          <p className="text-xs mb-4 animate-fade-up" style={{ color: 'var(--text-muted)' }}>
            {filtered.length === 0
              ? 'No results for '
              : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for `}
            <span style={{ color: '#a78bfa' }}>"{search}"</span>
            {filtered.length > 0 && (
              <button
                className="ml-2 underline"
                style={{ color: 'var(--text-dim)' }}
                onClick={() => setSearch('')}
              >
                clear
              </button>
            )}
          </p>
        )}

        {/* ── Category pills ── */}
        <div className="flex flex-wrap gap-2 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setExpanded(null) }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: category === cat ? 'var(--accent-soft)' : 'transparent',
                color:      category === cat ? '#a78bfa'            : 'var(--text-muted)',
                border:     `1px solid ${category === cat ? 'rgba(124,92,252,0.45)' : 'var(--border)'}`,
              }}
            >
              {cat !== 'All' && (CAT_ICONS[cat] ?? '')} {cat}
            </button>
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="text-center py-20 animate-fade-up">
            <span className="text-5xl">🤷</span>
            <p className="mt-4 font-semibold text-white">No results found.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Try different keywords or{' '}
              <button className="underline" style={{ color: '#a78bfa' }} onClick={() => { setSearch(''); setCategory('All') }}>
                reset all filters
              </button>
              .
            </p>
          </div>
        )}

        {/* ── Grouped accordion ── */}
        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat} className="mb-10 animate-fade-up">

            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{CAT_ICONS[cat] ?? '📁'}</span>
              <h2 className="text-sm font-bold text-white tracking-wide">{cat}</h2>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}
              >
                {items.length}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* Items */}
            <div className="space-y-2">
              {items.map((item, i) => {
                const isOpen = expanded === item.id
                return (
                  <div
                    key={item.id}
                    className="card overflow-hidden animate-fade-up"
                    style={{ animationDelay: `${0.03 * i}s` }}
                  >
                    {/* Question row */}
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full text-left px-5 py-4 flex items-start gap-3 transition-colors"
                      style={{ background: isOpen ? 'rgba(124,92,252,0.08)' : 'transparent' }}
                      aria-expanded={isOpen}
                    >
                      <span
                        className="shrink-0 mt-0.5 text-xs transition-transform"
                        style={{
                          color: '#a78bfa',
                          display: 'inline-block',
                          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                          transitionDuration: '180ms',
                        }}
                      >
                        ▶
                      </span>
                      <span className="font-semibold text-white text-sm leading-relaxed">
                        {highlight(item.q, search)}
                      </span>
                    </button>

                    {/* Answer panel */}
                    {isOpen && (
                      <div
                        className="px-5 pb-5 pt-4"
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        <p
                          className="text-sm leading-7"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {typeof item.a === 'string' ? highlight(item.a, search) : item.a}
                        </p>

                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-4">
                            {item.tags.map(t => (
                              <button
                                key={t}
                                onClick={() => setSearch(t)}
                                className="text-[10px] px-2 py-0.5 rounded-full transition-all hover:border-purple-600"
                                style={{
                                  background: 'var(--bg-hover)',
                                  color:      'var(--text-dim)',
                                  border:     '1px solid var(--border)',
                                }}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* ── Footer note ── */}
        {filtered.length > 0 && !search && (
          <p className="text-center text-xs mt-4 pb-6" style={{ color: 'var(--text-dim)' }}>
            Didn&apos;t find what you&apos;re looking for?{' '}
            <a
              href="https://github.com/Gzeu/openclaw-hub/issues"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#a78bfa' }}
            >
              Open an issue on GitHub ↗
            </a>
          </p>
        )}

      </div>
    </div>
  )
}
