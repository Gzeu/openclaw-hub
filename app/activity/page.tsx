'use client'

import { useEffect, useState } from 'react'

type ActivityType = 'sandbox_run' | 'chat_message' | 'delegate' | 'file_upload' | 'desktop_action' | 'mcp_call'

interface ActivityEntry {
  id: string
  type: ActivityType
  agentId?: string
  summary: string
  meta?: Record<string, any>
  durationMs?: number
  status: 'success' | 'error' | 'running'
  createdAt: string
}

const TYPE_CONFIG: Record<ActivityType, { icon: string; color: string }> = {
  sandbox_run:    { icon: '⚡', color: 'text-violet-400' },
  chat_message:   { icon: '💬', color: 'text-sky-400' },
  delegate:       { icon: '🔀', color: 'text-emerald-400' },
  file_upload:    { icon: '📂', color: 'text-amber-400' },
  desktop_action: { icon: '🖥️', color: 'text-pink-400' },
  mcp_call:       { icon: '🔌', color: 'text-cyan-400' },
}

const STATUS_COLOR = {
  success: 'bg-emerald-500/20 text-emerald-300',
  error:   'bg-red-500/20 text-red-300',
  running: 'bg-amber-500/20 text-amber-300',
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await fetch('/api/activity?limit=100')
      const data = await res.json()
      setEntries(data.activity ?? [])
    } catch {}
    setLoading(false)
  }

  const clear = async () => {
    await fetch('/api/activity', { method: 'DELETE' })
    setEntries([])
  }

  useEffect(() => {
    load()
    const iv = setInterval(load, 5000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">🦾</span>
            <span className="font-bold tracking-tight">OpenClaw Hub</span>
          </a>
          <nav className="flex gap-1">
            {[['/', 'Projects'], ['/agents', 'Agents'], ['/analyst', 'AI Analyst'], ['/activity', 'Activity']].map(([href, label]) => (
              <a key={href} href={href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  href === '/activity' ? 'bg-cyan-600/20 text-cyan-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}>
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-zinc-500">{entries.length} events · auto-refresh 5s</span>
            <button onClick={clear} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔌 Activity Log</h1>
          <p className="text-zinc-400">Live feed of everything agents are doing — sandbox runs, MCP calls, delegations, uploads.</p>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">😴</p>
            <p className="text-zinc-400">No activity yet — start chatting with agents or run sandbox code.</p>
          </div>
        )}

        <div className="space-y-2">
          {entries.map((e) => {
            const cfg = TYPE_CONFIG[e.type]
            return (
              <div
                key={e.id}
                className="flex items-start gap-4 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors"
              >
                <span className="text-lg mt-0.5">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>
                      {e.type.replace('_', ' ')}
                    </span>
                    {e.agentId && (
                      <span className="text-xs text-zinc-600 font-mono truncate max-w-[140px]">
                        {e.agentId}
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[e.status]}`}>
                      {e.status}
                    </span>
                    {e.durationMs && (
                      <span className="text-[10px] text-zinc-600">{e.durationMs}ms</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 mt-0.5 truncate">{e.summary}</p>
                  {e.meta && Object.keys(e.meta).length > 0 && (
                    <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                      {JSON.stringify(e.meta)}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0 mt-1">
                  {new Date(e.createdAt).toLocaleTimeString()}
                </span>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
