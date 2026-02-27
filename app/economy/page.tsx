'use client'

import { useState, useEffect } from 'react'
import type { GigListing, LoopResult } from '@/lib/agent-economy'

const PLATFORMS = [
  { id: 'thecolony', name: 'The Colony', url: 'https://thecolony.cc', color: '#7c3aed', icon: '🏛️', currency: 'karma + sats' },
  { id: 'moltverr', name: 'Moltverr', url: 'https://www.moltverr.com', color: '#0891b2', icon: '💼', currency: 'USD/crypto' },
  { id: 'opentask', name: 'OpenTask', url: 'https://opentask.ai', color: '#059669', icon: '📋', currency: 'USD $5–$400' },
  { id: 'ugig', name: 'ugig.net', url: 'https://ugig.net', color: '#d97706', icon: '🔗', currency: 'SOL/ETH/USDC' },
]

export default function EconomyPage() {
  const [tasks, setTasks] = useState<{ platform: string; count: number; tasks: GigListing[] }[]>([])
  const [loopResult, setLoopResult] = useState<LoopResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loopRunning, setLoopRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'earnings' | 'loop'>('tasks')

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    try {
      const colonyKey = localStorage.getItem('colony_api_key') ?? ''
      const url = `/api/agents/tasks?limit=8${colonyKey ? `&colonyKey=${encodeURIComponent(colonyKey)}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.ok) setTasks(data.platforms ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function triggerLoop() {
    setLoopRunning(true)
    setLoopResult(null)
    try {
      const colonyApiKey = localStorage.getItem('colony_api_key') ?? ''
      const res = await fetch('/api/agents/loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run',
          agent: {
            id: 'openclaw-main',
            name: 'OpenClaw Main Agent',
            capabilities: ['code-analysis', 'data-research', 'technical-writing'],
            colonyApiKey,
          },
        }),
      })
      const data = await res.json()
      if (data.ok) setLoopResult(data.data)
    } catch {
      // ignore
    } finally {
      setLoopRunning(false)
    }
  }

  const totalTasks = tasks.reduce((s, p) => s + p.count, 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            🤖 Agent Economy
          </h1>
          <p className="text-gray-400 text-sm">
            Agenții tăi muncesc autonom pe platformele din ecosistem și câștigă karma, sats, și crypto.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {PLATFORMS.map((p) => {
            const platformData = tasks.find((t) => t.platform === p.id)
            return (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#111] border border-[#222] rounded-xl p-4 hover:border-[#333] transition-colors group"
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="font-semibold text-sm text-white">{p.name}</div>
                <div className="text-xs text-gray-500 mt-1">{p.currency}</div>
                {platformData && (
                  <div
                    className="mt-2 text-xs font-bold"
                    style={{ color: p.color }}
                  >
                    {platformData.count} tasks open
                  </div>
                )}
              </a>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#111] rounded-lg p-1 w-fit">
          {(['tasks', 'loop', 'earnings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#23F7DD] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'tasks' ? `📋 Tasks (${totalTasks})` : tab === 'loop' ? '⚡ Run Loop' : '💰 Earnings'}
            </button>
          ))}
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-gray-500 text-sm">Loading tasks from all platforms...</div>
            ) : tasks.length === 0 ? (
              <div className="text-gray-600 text-sm">
                No tasks loaded. Configure your Colony API key to see live dispatches.
              </div>
            ) : (
              tasks.map((platform) => (
                <div key={platform.platform}>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                    {platform.platform} — {platform.count} open
                  </div>
                  <div className="grid gap-3">
                    {platform.tasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-white truncate">
                              {task.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {task.description}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-[#23F7DD]">
                              {task.budget} {task.currency}
                            </div>
                            <a
                              href={task.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                            >
                              view →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            <button
              onClick={fetchTasks}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        )}

        {/* Loop Tab */}
        {activeTab === 'loop' && (
          <div className="space-y-6">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
              <h2 className="font-semibold text-white mb-2">⚡ Autonomous Agent Loop</h2>
              <p className="text-sm text-gray-400 mb-4">
                Agentul scanează platformele, preia cel mai bun task disponibil, îl execută în E2B sandbox, livrează rezultatul și câștigă karma/sats.
                În producție, rulează automat la fiecare 15 minute via Vercel Cron.
              </p>
              <div className="bg-[#0d0d0d] rounded-lg p-3 text-xs font-mono text-gray-500 mb-4">
                <div>1. Scan TheColony dispatches (karma ≥ 5)</div>
                <div>2. Fallback → Moltverr gigs</div>
                <div>3. Execute in E2B Python sandbox</div>
                <div>4. Generate AI report via OpenRouter</div>
                <div>5. Submit → earn karma + sell doc for 500 sats</div>
              </div>
              <button
                onClick={triggerLoop}
                disabled={loopRunning}
                className="px-6 py-2.5 bg-[#23F7DD] text-black font-semibold rounded-lg text-sm hover:bg-[#1de0c8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loopRunning ? '⏳ Running...' : '▶ Run Agent Loop Now'}
              </button>
            </div>

            {loopResult && (
              <div
                className={`bg-[#111] border rounded-xl p-6 ${
                  loopResult.status === 'success'
                    ? 'border-[#23F7DD]/30'
                    : loopResult.status === 'no_tasks'
                    ? 'border-yellow-500/30'
                    : 'border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">
                    {loopResult.status === 'success'
                      ? '✅'
                      : loopResult.status === 'no_tasks'
                      ? '⚠️'
                      : '❌'}
                  </span>
                  <span className="font-semibold text-white">
                    {loopResult.status === 'success'
                      ? 'Task completed'
                      : loopResult.status === 'no_tasks'
                      ? 'No tasks available'
                      : 'Error'}
                  </span>
                  <span className="ml-auto text-xs text-gray-600">
                    {loopResult.executionMs}ms
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {loopResult.taskTitle && (
                    <div>
                      <span className="text-gray-500">Task: </span>
                      <span className="text-white">{loopResult.taskTitle}</span>
                    </div>
                  )}
                  {loopResult.platform && loopResult.platform !== 'error' && (
                    <div>
                      <span className="text-gray-500">Platform: </span>
                      <span className="text-[#23F7DD]">{loopResult.platform}</span>
                    </div>
                  )}
                  {loopResult.karmaEarned !== undefined && (
                    <div>
                      <span className="text-gray-500">Karma earned: </span>
                      <span className="text-yellow-400">+{loopResult.karmaEarned} karma</span>
                    </div>
                  )}
                  {loopResult.docSold && (
                    <div>
                      <span className="text-gray-500">Doc sold: </span>
                      <a
                        href={loopResult.docSold.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#23F7DD] hover:underline"
                      >
                        {loopResult.docSold.priceSats} sats →
                      </a>
                    </div>
                  )}
                  {loopResult.outputPreview && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Output preview:</div>
                      <div className="bg-[#0d0d0d] rounded-lg p-3 text-xs text-gray-400 font-mono whitespace-pre-wrap">
                        {loopResult.outputPreview}
                      </div>
                    </div>
                  )}
                  {loopResult.error && (
                    <div className="text-red-400 text-xs font-mono">
                      Error: {loopResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">💰 Income Overview</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'TheColony Karma', value: '—', sub: 'Configure API key', color: '#7c3aed' },
                  { label: 'Lightning Sats', value: '—', sub: 'From doc sales', color: '#f59e0b' },
                  { label: 'EGLD Earned', value: '—', sub: 'Internal tasks', color: '#23F7DD' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#0d0d0d] rounded-xl p-4 border border-[#1a1a1a]"
                  >
                    <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-3">Setup Guide</div>
              <div className="space-y-2 text-sm text-gray-400">
                <div>1. Register agent on TheColony via the Loop tab</div>
                <div>2. Save your Colony API key in localStorage (key: <code className="text-[#23F7DD] bg-[#0d0d0d] px-1 rounded">colony_api_key</code>)</div>
                <div>3. Add <code className="text-[#23F7DD] bg-[#0d0d0d] px-1 rounded">COLONY_AGENT_API_KEY</code> to Vercel env vars</div>
                <div>4. Enable Vercel Cron for <code className="text-[#23F7DD] bg-[#0d0d0d] px-1 rounded">/api/cron/agent-loop</code></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
