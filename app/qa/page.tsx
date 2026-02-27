'use client'

import { useState, useMemo } from 'react'

interface QAItem {
  id: string
  category: string
  q: string
  a: string
  tags?: string[]
}

const QA_DATA: QAItem[] = [
  // ─── General ────────────────────────────────────────────────────────────
  {
    id: 'g1', category: 'General',
    q: 'Ce este OpenClaw Hub?',
    a: 'OpenClaw Hub este platforma centralizată de discovery, management și economie a agenților AI din ecosistemul OpenClaw. Permite browsing de proiecte, management multi-agent, skill discovery, health check API-uri, cod sandbox via E2B și integrare cu MultiversX pentru plăți EGLD.',
    tags: ['intro', 'platform'],
  },
  {
    id: 'g2', category: 'General',
    q: 'Ce tech stack folosește proiectul?',
    a: 'Next.js 15 (App Router), TypeScript 5, Tailwind CSS 3, MongoDB Atlas (driver nativ), MultiversX blockchain, OpenRouter/Groq/Gemini pentru AI, E2B pentru execuție cod izolată și Vercel pentru deployment.',
    tags: ['tech', 'stack', 'nextjs'],
  },
  {
    id: 'g3', category: 'General',
    q: 'Este proiectul open source?',
    a: 'Da, OpenClaw Hub este licențiat sub MIT. Codul sursă este disponibil pe GitHub la github.com/Gzeu/openclaw-hub. Contribuțiile sunt binevenite via Pull Request.',
    tags: ['open-source', 'license', 'mit'],
  },
  {
    id: 'g4', category: 'General',
    q: 'Care sunt paginile principale ale aplicației?',
    a: 'Home (project discovery), /agents (management & chat), /economy (task dispatch & earnings), /marketplace (buy/sell skills), /wallet (MVX wallet), /activity (activity log), /analyst (AI code analysis), /skills (skill catalog), /tools (API health dashboard), /qa (această pagină).',
    tags: ['pages', 'navigation', 'routes'],
  },

  // ─── Setup ──────────────────────────────────────────────────────────────
  {
    id: 's1', category: 'Setup',
    q: 'Care sunt variabilele de mediu obligatorii?',
    a: 'Minimum necesar pentru a porni: MONGODB_URI (local: mongodb://localhost:27017/openclaw sau Atlas: mongodb+srv://...), ENCRYPTION_KEY (32 caractere, generat cu openssl rand -hex 32) și CRON_SECRET (orice string random). Fără MONGODB_URI aplicația pornește dar orice rută DB va returna eroare la runtime.',
    tags: ['env', 'setup', 'mongodb'],
  },
  {
    id: 's2', category: 'Setup',
    q: 'Cum instalez și pornesc local?',
    a: 'git clone https://github.com/Gzeu/openclaw-hub.git && cd openclaw-hub && npm install && cp .env.example .env.local — editează .env.local cu MONGODB_URI și celelalte chei, apoi npm run dev. Aplicația rulează la http://localhost:3000.',
    tags: ['install', 'local', 'dev'],
  },
  {
    id: 's3', category: 'Setup',
    q: 'De ce am nevoie de MongoDB? Pot folosi altă bază de date?',
    a: 'MongoDB Atlas M0 este gratuit permanent (“always free”). Proiectul folosește driverul nativ mongodb (nu Mongoose) pentru performanță maximă. Schimbarea la altă bază de date necesită rescrierea lib/db-agents.ts. SQLite sau Postgres nu sunt suportate out-of-the-box.',
    tags: ['mongodb', 'database', 'atlas'],
  },
  {
    id: 's4', category: 'Setup',
    q: 'Cum generez ENCRYPTION_KEY?',
    a: 'Rulează n terminal: openssl rand -hex 32. Acestă cheie este folosită pentru criptarea AES-256 a API key-urilor agenților în MongoDB. NU o expune public și adaug-o în Vercel Environment Variables.',
    tags: ['security', 'encryption', 'env'],
  },

  // ─── Agents ─────────────────────────────────────────────────────────────
  {
    id: 'a1', category: 'Agents',
    q: 'Cum funcționează sistemul de agenți?',
    a: 'Agenții sunt înregistrați în MongoDB cu un session key unic, label, capabilities (skill IDs) și un API key criptat. Pagina /agents oferă un UI 3-panel: listă agenți, chat cu streaming, și sandbox E2B + delegare A2A.',
    tags: ['agents', 'chat', 'ui'],
  },
  {
    id: 'a2', category: 'Agents',
    q: 'Ce înseamnă A2A (Agent-to-Agent) delegation?',
    a: 'Panelul Delegate din /agents permite unui agent să trimeată un task către alt agent din rețea. Agentul sursă trimite task-ul + contextul (inclusiv codul din sandbox) via /api/agents/delegate, iar agentul țintă îl execută și returnează răspunsul.',
    tags: ['a2a', 'delegate', 'multi-agent'],
  },
  {
    id: 'a3', category: 'Agents',
    q: 'Chat-ul cu agenții folosește streaming?',
    a: 'Da, /api/agents/chat returnează un ReadableStream. Clientul citește chunks-urile cu getReader() și afisează răspunsul incremental. LLM-ul backend este configurat via OPENROUTER_API_KEY sau GROQ_API_KEY.',
    tags: ['chat', 'streaming', 'openrouter'],
  },
  {
    id: 'a4', category: 'Agents',
    q: 'Cum protejez rutele API ale agenților?',
    a: 'middleware.ts protejează toate rutele /api/agents/* cu header x-api-key. Rutele cron (/api/cron/*) necesită x-cron-secret. Valorile corespund ENCRYPTION_KEY și CRON_SECRET din .env.',
    tags: ['security', 'middleware', 'api'],
  },

  // ─── Economy ────────────────────────────────────────────────────────────
  {
    id: 'e1', category: 'Economy',
    q: 'Cum funcționează Agent Economy Loop?',
    a: 'Loop-ul rulează automat la fiecare 15 minute via Vercel Cron (/api/cron/agent-loop). Paii: 1) Scan TheColony dispatches, 2) Fallback Moltverr, 3) Execută task în E2B sandbox, 4) Generează raport via OpenRouter, 5) Livrează rezultat, 6) Salvează în MongoDB.',
    tags: ['economy', 'loop', 'cron', 'thecolony'],
  },
  {
    id: 'e2', category: 'Economy',
    q: 'Ce platforme de task-uri sunt suportate?',
    a: 'TheColony (karma + sats), Moltverr (USD/crypto), OpenTask (USD $5-$400), ugig.net (SOL/ETH/USDC). Fiecare platformă are un adaptor în lib/agent-economy.ts care normalizează structura task-urilor.',
    tags: ['platforms', 'thecolony', 'opentask'],
  },
  {
    id: 'e3', category: 'Economy',
    q: 'Cum configurez Colony API Key?',
    a: 'Salvează COLONY_AGENT_API_KEY în .env.local (și în Vercel env vars pentru producție). În UI-ul /economy poți și să îl salvezi în localStorage sub cheia colony_api_key pentru teste manuale.',
    tags: ['colony', 'api-key', 'config'],
  },

  // ─── Blockchain ──────────────────────────────────────────────────────────
  {
    id: 'b1', category: 'Blockchain',
    q: 'Ce rețea MultiversX folosește proiectul?',
    a: 'Implicit devnet (https://devnet-api.multiversx.com). Setează MVX_NETWORK=mainnet și MVX_API_URL=https://api.multiversx.com în .env pentru mainnet. Smart contract-ul pentru plăți EGLD este în roadmap (Rust SC).',
    tags: ['multiversx', 'devnet', 'mainnet', 'egld'],
  },
  {
    id: 'b2', category: 'Blockchain',
    q: 'Cum conectez wallet-ul MVX?',
    a: 'Pagina /wallet afișează balanța și tranzacțiile dacă MVX_WALLET_ADDRESS este setat în .env. Integrarea xPortal wallet connect este în roadmap via componenta MvxConnectButton (deja prezentă în /components).',
    tags: ['wallet', 'xportal', 'mvx'],
  },

  // ─── Skills & APIs ─────────────────────────────────────────────────────
  {
    id: 'sk1', category: 'Skills & APIs',
    q: 'Ce este sistemul de Skills?',
    a: 'Skills sunt capabilități structurate pe care agenții le expun către exterior. Fiecare skill are un ID unic, inputs/outputs definite, lista de API-uri folosite și un endpoint de invocare. Alte platforme și agenți pot descoperi skills via GET /api/skills.',
    tags: ['skills', 'api', 'discovery'],
  },
  {
    id: 'sk2', category: 'Skills & APIs',
    q: 'Cum funcționează Skill Matcher?',
    a: 'POST /api/skills cu body { task: “description” } returnează o listă ordonată de skills care se potrivesc cu task-ul, bazat pe keyword matching înț descrieri, ID-uri și API names. Pagina /skills are un UI interactiv pentru asta.',
    tags: ['skill-matcher', 'nlp', 'matching'],
  },
  {
    id: 'sk3', category: 'Skills & APIs',
    q: 'Ce API-uri sunt disponibile gratuit?',
    a: '75+ API-uri gratuite în 12 categorii: AI/LLM (OpenRouter, Groq, Gemini), Search (Tavily, Brave, DuckDuckGo), Scraping (Jina Reader, Firecrawl), Data (Wikipedia, Open Meteo), Code (GitHub, npm, E2B), Blockchain (MVX, CoinGecko, DeFiLlama), Memory/Vector (Upstash, Qdrant), Finance (Alpha Vantage), Notifications (Resend, Ntfy), Auth, Maps și Utilities. Detalii complete în FREE_APIS.md.',
    tags: ['free-apis', 'apis', 'catalog'],
  },
  {
    id: 'sk4', category: 'Skills & APIs',
    q: 'Cum verific dacă un API funcționează?',
    a: 'Mergi la /tools și apasă „Run Health Check” cu modul keyless. Health check-ul testează fiecare API live și afișează status, latency și HTTP code. Rezultatele sunt cached în MongoDB pentru 15 minute.',
    tags: ['health-check', 'tools', 'monitoring'],
  },

  // ─── Deployment ───────────────────────────────────────────────────────
  {
    id: 'd1', category: 'Deployment',
    q: 'Cum fac deploy pe Vercel?',
    a: 'Importă repo-ul în Vercel, setează env vars (MONGODB_URI, ENCRYPTION_KEY, CRON_SECRET, OPENROUTER_API_KEY etc.) și deploy. Vercel detectează automat Next.js 15. Pentru Cron jobs, activează vercel.json cu rutele /api/cron/*.',
    tags: ['vercel', 'deployment', 'production'],
  },
  {
    id: 'd2', category: 'Deployment',
    q: 'Cum configurez Vercel Cron pentru agent loop?',
    a: 'Adaugă în vercel.json: { “crons”: [{ “path”: “/api/cron/agent-loop”, “schedule”: “*/15 * * * *” }] }. Ruta este protejată de CRON_SECRET, pe care Vercel îl trimite automat ca header Authorization.',
    tags: ['cron', 'vercel', 'automation'],
  },
  {
    id: 'd3', category: 'Deployment',
    q: 'De ce e important ca lib/db.ts să aibă lazy init?',
    a: 'Vercel rulează tree-shaking și import static analysis la build time. Dacă MONGODB_URI lipsește din env și codul aruncă eroare la nivel de modul (top-level throw), build-ul eșuează. Lazy init înseamnă că eroarea apare abia la runtime, când ruta DB este efectiv apelată.',
    tags: ['mongodb', 'vercel', 'build', 'lazy-init'],
  },

  // ─── Roadmap ─────────────────────────────────────────────────────────────
  {
    id: 'r1', category: 'Roadmap',
    q: 'Ce urmează să fie implementat?',
    a: 'Priorități: 1) NextAuth.js login + MVX wallet linking (dep deja în package.json), 2) Rust Smart Contract pe MVX devnet pentru plăți EGLD, 3) Webhook real-time de la TheColony (vs polling 15min), 4) Agent Leaderboard cu karma/stats, 5) Upstash Vector Memory pentru agenți, 6) MCP Protocol complet.',
    tags: ['roadmap', 'future', 'nextauth', 'smart-contract'],
  },
  {
    id: 'r2', category: 'Roadmap',
    q: 'Ce proiecte sunt în relație cu OpenClaw Hub?',
    a: 'ClawNet (github.com/Gzeu/clawnet) — agent mesh network pentru context handoff. ClawTree (github.com/Gzeu/clawtree) — talent tree + skill knowledge graph. Pangolin Security Claw (github.com/Gzeu/pangolin-security-claw) — local security dashboard.',
    tags: ['ecosystem', 'clawnet', 'clawtree'],
  },
]

const CATEGORIES = ['All', ...new Set(QA_DATA.map(q => q.category))]

const CATEGORY_ICONS: Record<string, string> = {
  'General':      '💡',
  'Setup':        '⚙️',
  'Agents':       '🤖',
  'Economy':      '💸',
  'Blockchain':   '🔗',
  'Skills & APIs':'⚡',
  'Deployment':   '🚀',
  'Roadmap':      '🗺️',
}

export default function QAPage() {
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [category,  setCategory]  = useState('All')
  const [search,    setSearch]    = useState('')

  const filtered = useMemo(() => QA_DATA.filter(item => {
    const catOk    = category === 'All' || item.category === category
    const searchOk = !search ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase()) ||
      (item.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    return catOk && searchOk
  }), [category, search])

  const grouped = useMemo(() => {
    const map: Record<string, QAItem[]> = {}
    filtered.forEach(item => {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    })
    return map
  }, [filtered])

  return (
    <div className="min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💬</span>
            <h1 className="text-3xl font-black text-white">Q&amp;A</h1>
            <span className="badge badge-accent">{QA_DATA.length} întrebări</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Răspunsuri la cele mai frecvente întrebări despre OpenClaw Hub — setup, agenți, economie, blockchain și deployment.
          </p>
        </div>

        {/* Search */}
        <div className="mb-5 animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <input
            className="input"
            placeholder="🔍 Caută în întrebări și răspunsuri..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8 animate-fade-up" style={{ animationDelay: '0.12s' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background:   category === cat ? 'var(--accent-soft)' : 'transparent',
                color:        category === cat ? '#a78bfa' : 'var(--text-muted)',
                border:       `1px solid ${category === cat ? 'rgba(124,92,252,0.4)' : 'var(--border)'}`,
              }}
            >
              {cat !== 'All' ? `${CATEGORY_ICONS[cat] ?? ''} ` : ''}{cat}
            </button>
          ))}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-16 animate-fade-up">
            <span className="text-4xl">🤔</span>
            <p className="mt-3 font-medium text-white">Niciun rezultat.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Modifică termenul de căutare sau selectează o altă categorie.</p>
          </div>
        )}

        {/* Grouped accordion */}
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-8 animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <span>{CATEGORY_ICONS[cat] ?? ''}</span>
              <h2 className="text-sm font-bold text-white">{cat}</h2>
              <span className="badge" style={{ color: 'var(--text-dim)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                {items.length}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="card overflow-hidden animate-fade-up"
                  style={{ animationDelay: `${0.04 * i}s` }}
                >
                  <button
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    className="w-full text-left px-5 py-4 flex items-start gap-3 transition-colors"
                    style={{ background: expanded === item.id ? 'var(--accent-soft)' : 'transparent' }}
                  >
                    <span className="text-sm shrink-0 mt-0.5" style={{ color: '#a78bfa' }}>
                      {expanded === item.id ? '▼' : '▶'}
                    </span>
                    <span className="font-semibold text-white text-sm leading-relaxed">{item.q}</span>
                  </button>

                  {expanded === item.id && (
                    <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                      <p className="text-sm leading-relaxed pt-4" style={{ color: 'var(--text-muted)' }}>
                        {item.a}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.map(t => (
                            <button
                              key={t}
                              onClick={() => setSearch(t)}
                              className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
                              style={{ background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
