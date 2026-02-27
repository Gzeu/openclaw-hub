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

const TYPE_CONFIG: Record<ActivityType, { icon: string; color: string; label: string }> = {
  sandbox_run:    { icon: '⚡', color: '#a78bfa', label: 'Sandbox Run' },
  chat_message:   { icon: '💬', color: '#38bdf8', label: 'Chat' },
  delegate:       { icon: '🔀', color: 'var(--green)', label: 'Delegate' },
  file_upload:    { icon: '📂', color: 'var(--amber)', label: 'File Upload' },
  desktop_action: { icon: '🖥️', color: '#f472b6', label: 'Desktop' },
  mcp_call:       { icon: '🔌', color: 'var(--cyan)', label: 'MCP Call' },
}

const STATUS_BADGE: Record<string, string> = {
  success: 'badge badge-green',
  error:   'badge badge-red',
  running: 'badge badge-amber',
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const load = async () => {
    try {
      const data = await fetch('/api/activity?limit=100').then(r => r.json())
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

  const filtered = typeFilter === 'all' ? entries : entries.filter(e => e.type === typeFilter)
  const types    = ['all', ...new Set(entries.map(e => e.type))]

  const stats = {
    total:   entries.length,
    success: entries.filter(e => e.status === 'success').length,
    error:   entries.filter(e => e.status === 'error').length,
    running: entries.filter(e => e.status === 'running').length,
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📡</span>
              <h1 className="text-3xl font-black text-white">Activity Log</h1>
              <span className="badge badge-green">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">
              Real-time feed of everything agents are doing — auto-refreshes every 5s.
            </p>
          </div>
          <button onClick={clear} className="btn btn-ghost text-xs" style={{ color: 'var(--red)', borderColor: 'rgba(244,63,94,0.3)' }}>
            🗑️ Clear
          </button>
        </div>

        {/* Stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.06s' }}>
            {([
              { key: 'total',   label: 'Total',   color: 'var(--text)',  bg: 'var(--bg-card)' },
              { key: 'success', label: 'Success', color: 'var(--green)', bg: 'var(--green-soft)' },
              { key: 'error',   label: 'Errors',  color: 'var(--red)',   bg: 'rgba(244,63,94,.1)' },
              { key: 'running', label: 'Running', color: 'var(--amber)', bg: 'rgba(245,158,11,.1)' },
            ] as const).map(({ key, label, color, bg }) => (
              <div key={key} className="card p-4 text-center" style={{ background: bg }}>
                <div className="text-2xl font-black" style={{ color }}>{stats[key]}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Type filter */}
        {entries.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {types.map(t => {
              const cfg = t !== 'all' ? TYPE_CONFIG[t as ActivityType] : null
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background:   typeFilter === t ? 'var(--accent-soft)' : 'transparent',
                    color:        typeFilter === t ? '#a78bfa' : 'var(--text-muted)',
                    border:       `1px solid ${typeFilter === t ? 'rgba(124,92,252,0.4)' : 'var(--border)'}`,
                  }}
                >
                  {cfg ? `${cfg.icon} ${cfg.label}` : 'All'}
                </button>
              )
            })}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl skeleton" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && entries.length === 0 && (
          <div className="text-center py-20 animate-fade-up">
            <span className="text-5xl">😴</span>
            <p className="mt-4 font-medium text-white">No activity yet.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Start chatting with agents or run sandbox code.
            </p>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-2">
          {filtered.map((e, i) => {
            const cfg = TYPE_CONFIG[e.type]
            return (
              <div
                key={e.id}
                className="card p-4 flex items-start gap-4 animate-fade-up"
                style={{ animationDelay: `${0.02 * i}s` }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{ background: cfg.color + '15', border: `1px solid ${cfg.color}30` }}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: cfg.color }}>
                      {cfg.label.toUpperCase()}
                    </span>
                    {e.agentId && (
                      <span className="text-xs mono truncate max-w-[160px]" style={{ color: 'var(--text-dim)' }}>
                        {e.agentId}
                      </span>
                    )}
                    <span className={STATUS_BADGE[e.status]}>{e.status}</span>
                    {e.durationMs && (
                      <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{e.durationMs}ms</span>
                    )}
                  </div>
                  <p className="text-sm mt-1 text-white truncate">{e.summary}</p>
                  {e.meta && Object.keys(e.meta).length > 0 && (
                    <p className="text-[10px] mt-0.5 mono" style={{ color: 'var(--text-dim)' }}>
                      {JSON.stringify(e.meta)}
                    </p>
                  )}
                </div>
                <span className="text-[10px] shrink-0 mt-1" style={{ color: 'var(--text-dim)' }}>
                  {new Date(e.createdAt).toLocaleTimeString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
