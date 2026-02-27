'use client';

import { useState, useEffect } from 'react';

interface ApiResult {
  apiId: string; apiName: string; category: string;
  status: 'ok' | 'degraded' | 'error' | 'unconfigured' | 'unknown';
  statusCode?: number; latencyMs?: number; error?: string;
  keyConfigured: boolean; keyless: boolean;
  provides: string[]; checkedAt?: string;
}

const STATUS_META: Record<string, { icon: string; badge: string; label: string }> = {
  ok:           { icon: '✅', badge: 'badge badge-green',  label: 'OK'           },
  degraded:     { icon: '⚠️', badge: 'badge badge-amber',  label: 'Degraded'     },
  error:        { icon: '❌', badge: 'badge badge-red',    label: 'Error'        },
  unconfigured: { icon: '⬜', badge: 'badge',              label: 'Unconfigured' },
  unknown:      { icon: '❓', badge: 'badge',              label: 'Unknown'      },
};

const CATEGORY_LABELS: Record<string, string> = {
  ai_llm:       '🤖 AI / LLM',
  search:       '🔍 Search',
  scraping:     '🌐 Scraping',
  data:         '📊 Data',
  blockchain:   '🔗 Blockchain',
  code:         '💻 Code',
  storage:      '📁 Storage',
  utility:      '🛠️ Utility',
  agent_economy: '💰 Economy',
};

export default function ToolsPage() {
  const [results,         setResults]         = useState<ApiResult[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [mode,            setMode]            = useState<'keyless'|'configured'|'all'>('keyless');
  const [discovery,       setDiscovery]       = useState<Record<string, string[]> | null>(null);
  const [filter,          setFilter]          = useState('all');
  const [capability,      setCapability]      = useState('');
  const [integrateResult, setIntegrateResult] = useState<object | null>(null);

  useEffect(() => { loadStored(); }, []);

  async function loadStored() {
    try { const d = await fetch('/api/tools/check').then(r => r.json()); if (d.results) setResults(d.results); } catch {}
  }
  async function runCheck() {
    setLoading(true);
    try {
      const d = await fetch('/api/tools/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }) }).then(r => r.json());
      if (d.summary?.results) setResults(d.summary.results);
    } finally { setLoading(false); }
  }
  async function runDiscover() {
    setLoading(true);
    try {
      const d = await fetch('/api/tools/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'discover' }) }).then(r => r.json());
      setDiscovery(d.capabilities ?? {});
    } finally { setLoading(false); }
  }
  async function findIntegration() {
    if (!capability.trim()) return;
    setLoading(true);
    try {
      const d = await fetch('/api/tools/integrate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ capability: capability.trim() }) }).then(r => r.json());
      setIntegrateResult(d);
    } finally { setLoading(false); }
  }

  const categories = ['all', ...new Set(results.map(r => r.category))];
  const filtered   = filter === 'all' ? results : results.filter(r => r.category === filter);
  const stats      = {
    ok:           results.filter(r => r.status === 'ok').length,
    degraded:     results.filter(r => r.status === 'degraded').length,
    error:        results.filter(r => r.status === 'error').length,
    unconfigured: results.filter(r => r.status === 'unconfigured').length,
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🛠️</span>
            <h1 className="text-3xl font-black text-white">API Tools</h1>
            {results.length > 0 && <span className="badge badge-accent">{results.length} APIs</span>}
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Health check, auto-discover, and integrate 75+ free APIs for OpenClaw agents.
          </p>
        </div>

        {/* Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.06s' }}>
            {([
              { key: 'ok',           label: 'Online',       color: 'var(--green)', bg: 'var(--green-soft)' },
              { key: 'degraded',     label: 'Degraded',     color: 'var(--amber)', bg: 'rgba(245,158,11,.1)' },
              { key: 'error',        label: 'Error',        color: 'var(--red)',   bg: 'rgba(244,63,94,.1)' },
              { key: 'unconfigured', label: 'No Key',       color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
            ] as const).map(({ key, label, color, bg }) => (
              <div key={key} className="card p-4 text-center" style={{ background: bg, borderColor: color + '30' }}>
                <div className="text-2xl font-black" style={{ color }}>{stats[key]}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="card p-5 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div>
              <p className="section-label mb-1.5">Check Mode</p>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as typeof mode)}
                className="input" style={{ width: 'auto' }}
              >
                <option value="keyless">Keyless only (no API key needed)</option>
                <option value="configured">Configured (keys in .env)</option>
                <option value="all">All APIs</option>
              </select>
            </div>
            <button onClick={runCheck} disabled={loading} className="btn btn-primary">
              {loading ? '⧗ Checking…' : '▶ Run Health Check'}
            </button>
            <button onClick={runDiscover} disabled={loading} className="btn btn-ghost">
              🔍 Auto-Discover
            </button>
          </div>

          {/* Capability finder */}
          <div>
            <p className="section-label mb-1.5">Find Best API for Capability</p>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="e.g. web_search, ai_completion, crypto_prices…"
                value={capability}
                onChange={e => setCapability(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && findIntegration()}
              />
              <button onClick={findIntegration} disabled={loading || !capability.trim()} className="btn btn-primary shrink-0">
                ⚡ Integrate
              </button>
            </div>
          </div>
        </div>

        {/* Integration result */}
        {integrateResult && (
          <div className="card p-5 mb-6" style={{ borderColor: 'rgba(16,217,138,0.3)' }}>
            <p className="section-label mb-2" style={{ color: 'var(--green)' }}>Integration Result</p>
            <pre className="mono text-xs overflow-auto" style={{ color: 'var(--text-muted)' }}>
              {JSON.stringify(integrateResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Discovery result */}
        {discovery && (
          <div className="card p-5 mb-6" style={{ borderColor: 'rgba(124,92,252,0.3)' }}>
            <p className="section-label mb-3" style={{ color: '#a78bfa' }}>🔍 Capability Map</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(discovery).map(([cap, apis]) => (
                <div key={cap} className="card p-3">
                  <div className="mono text-xs font-bold" style={{ color: '#a78bfa' }}>{cap}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{(apis as string[]).join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        {results.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background:   filter === cat ? 'var(--accent-soft)' : 'transparent',
                  color:        filter === cat ? '#a78bfa' : 'var(--text-muted)',
                  border:       `1px solid ${filter === cat ? 'rgba(124,92,252,0.4)' : 'var(--border)'}`,
                }}
              >
                {cat === 'all' ? 'All' : (CATEGORY_LABELS[cat] ?? cat)}
              </button>
            ))}
          </div>
        )}

        {/* Results list */}
        <div className="space-y-2">
          {filtered.map((r, i) => {
            const meta = STATUS_META[r.status];
            return (
              <div key={r.apiId} className="card p-3 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${0.02 * i}s` }}>
                <span className="text-lg w-6 shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{r.apiName}</span>
                    <span className={meta.badge}>{meta.label}</span>
                    {r.keyless && <span className="badge badge-cyan">keyless</span>}
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{CATEGORY_LABELS[r.category] ?? r.category}</span>
                  </div>
                  {r.provides.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.provides.map(p => (
                        <span key={p} className="text-[10px] px-1.5 py-0.5 rounded mono" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{p}</span>
                      ))}
                    </div>
                  )}
                  {r.error && <p className="text-xs mt-0.5" style={{ color: 'var(--red)' }}>{r.error}</p>}
                </div>
                <div className="text-right text-xs shrink-0" style={{ color: 'var(--text-dim)' }}>
                  {r.latencyMs != null && <div>{r.latencyMs}ms</div>}
                  {r.statusCode != null && <div>HTTP {r.statusCode}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-20 animate-fade-up">
            <span className="text-5xl">🔌</span>
            <p className="mt-4 font-medium text-white">No results yet.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Run a health check to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
