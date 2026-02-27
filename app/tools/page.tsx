/**
 * /tools — API Health Dashboard
 * Shows status of all registered APIs, supports live re-check.
 */
'use client';

import { useState, useEffect } from 'react';

interface ApiResult {
  apiId: string;
  apiName: string;
  category: string;
  status: 'ok' | 'degraded' | 'error' | 'unconfigured' | 'unknown';
  statusCode?: number;
  latencyMs?: number;
  error?: string;
  keyConfigured: boolean;
  keyless: boolean;
  provides: string[];
  checkedAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  ok: 'bg-green-500/20 text-green-400 border-green-800',
  degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-800',
  error: 'bg-red-500/20 text-red-400 border-red-800',
  unconfigured: 'bg-gray-500/20 text-gray-500 border-gray-800',
  unknown: 'bg-gray-500/20 text-gray-500 border-gray-800',
};

const STATUS_ICONS: Record<string, string> = {
  ok: '✅',
  degraded: '⚠️',
  error: '❌',
  unconfigured: '⬜',
  unknown: '❓',
};

const CATEGORY_LABELS: Record<string, string> = {
  ai_llm: '🤖 AI / LLM',
  search: '🔍 Search',
  scraping: '🌐 Scraping',
  data: '📊 Data',
  blockchain: '🔗 Blockchain',
  code: '💻 Code',
  storage: '📁 Storage',
  utility: '🛠️ Utility',
  agent_economy: '💰 Agent Economy',
};

export default function ToolsPage() {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'keyless' | 'configured' | 'all'>('keyless');
  const [discovery, setDiscovery] = useState<Record<string, string[]> | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [capability, setCapability] = useState('');
  const [integrateResult, setIntegrateResult] = useState<object | null>(null);

  useEffect(() => {
    loadStored();
  }, []);

  async function loadStored() {
    try {
      const res = await fetch('/api/tools/check');
      const data = await res.json();
      if (data.results) setResults(data.results);
    } catch {}
  }

  async function runCheck() {
    setLoading(true);
    try {
      const res = await fetch('/api/tools/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.summary?.results) setResults(data.summary.results);
    } finally {
      setLoading(false);
    }
  }

  async function runDiscover() {
    setLoading(true);
    try {
      const res = await fetch('/api/tools/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'discover' }),
      });
      const data = await res.json();
      setDiscovery(data.capabilities ?? {});
    } finally {
      setLoading(false);
    }
  }

  async function findIntegration() {
    if (!capability.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tools/integrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capability: capability.trim() }),
      });
      const data = await res.json();
      setIntegrateResult(data);
    } finally {
      setLoading(false);
    }
  }

  const categories = ['all', ...new Set(results.map((r) => r.category))];
  const filtered = filter === 'all' ? results : results.filter((r) => r.category === filter);

  const stats = {
    ok: results.filter((r) => r.status === 'ok').length,
    degraded: results.filter((r) => r.status === 'degraded').length,
    error: results.filter((r) => r.status === 'error').length,
    unconfigured: results.filter((r) => r.status === 'unconfigured').length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">🛠️ API Tools Dashboard</h1>
        <p className="text-gray-400 text-sm mb-6">
          Health check, auto-discover, and integrate free APIs for OpenClaw agents.
        </p>

        {/* Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {Object.entries(stats).map(([key, count]) => (
              <div key={key} className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-gray-500 capitalize">{key}</div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Check Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm"
              >
                <option value="keyless">Keyless only (no API key needed)</option>
                <option value="configured">Configured (have keys in .env)</option>
                <option value="all">All APIs</option>
              </select>
            </div>
            <button
              onClick={runCheck}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-1.5 rounded text-sm font-medium"
            >
              {loading ? 'Checking…' : '▶ Run Health Check'}
            </button>
            <button
              onClick={runDiscover}
              disabled={loading}
              className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 px-4 py-1.5 rounded text-sm font-medium"
            >
              🔍 Auto-Discover
            </button>
          </div>

          {/* Capability finder */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Find best API for capability… (e.g. web_search, ai_completion)"
              value={capability}
              onChange={(e) => setCapability(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && findIntegration()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm"
            />
            <button
              onClick={findIntegration}
              disabled={loading || !capability.trim()}
              className="bg-green-700 hover:bg-green-800 disabled:opacity-50 px-4 py-1.5 rounded text-sm font-medium"
            >
              ⚡ Integrate
            </button>
          </div>
        </div>

        {/* Integration result */}
        {integrateResult && (
          <div className="bg-gray-900 rounded-lg p-4 border border-green-900 mb-6">
            <h3 className="text-sm font-semibold text-green-400 mb-2">Integration Result</h3>
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(integrateResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Discovery result */}
        {discovery && (
          <div className="bg-gray-900 rounded-lg p-4 border border-purple-900 mb-6">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">
              🔍 Capability Map (auto-discovered)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(discovery).map(([cap, apis]) => (
                <div key={cap} className="bg-gray-800 rounded p-2">
                  <div className="text-xs font-mono text-purple-300">{cap}</div>
                  <div className="text-xs text-gray-400">{(apis as string[]).join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        {results.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  filter === cat
                    ? 'bg-gray-700 border-gray-500 text-white'
                    : 'bg-transparent border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        )}

        {/* Results table */}
        {filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((r) => (
              <div
                key={r.apiId}
                className="bg-gray-900 rounded-lg p-3 border border-gray-800 flex items-center gap-4"
              >
                <span className="text-lg w-6">{STATUS_ICONS[r.status]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{r.apiName}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[r.status]}`}
                    >
                      {r.status}
                    </span>
                    {r.keyless && (
                      <span className="text-xs px-2 py-0.5 rounded border border-blue-900 text-blue-400">
                        keyless
                      </span>
                    )}
                    <span className="text-xs text-gray-600">
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </span>
                  </div>
                  {r.provides.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.provides.map((p) => (
                        <span
                          key={p}
                          className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.error && <div className="text-xs text-red-400 mt-0.5">{r.error}</div>}
                </div>
                <div className="text-right text-xs text-gray-500 shrink-0">
                  {r.latencyMs != null && <div>{r.latencyMs}ms</div>}
                  {r.statusCode != null && <div>HTTP {r.statusCode}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-12">
            <p>No results yet. Run a health check to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
