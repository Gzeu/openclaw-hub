'use client';

import { useState } from 'react';

interface SkillInput  { name: string; type: string; required: boolean; description: string; example?: string; }
interface SkillOutput { name: string; type: string; description: string; }
interface SkillDef {
  id: string; name: string; description: string; category: string;
  inputs: SkillInput[]; outputs: SkillOutput[];
  apiIds: string[]; example: { endpoint: string; method: string; body?: object };
  costEstimate: string; avgLatencyMs: number; agentTypes: string[]; version: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  ai: '🤖', search: '🔍', code: '💻', blockchain: '🔗',
  data: '📊', content: '🌐', economy: '💰', utility: '🛠️',
};

const COST_BADGE: Record<string, string> = {
  free:   'badge badge-green',
  low:    'badge badge-cyan',
  medium: 'badge badge-amber',
  high:   'badge badge-red',
};

export default function SkillsPage() {
  const [skills,      setSkills]      = useState<SkillDef[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [loaded,      setLoaded]      = useState(false);
  const [filter,      setFilter]      = useState('all');
  const [search,      setSearch]      = useState('');
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [task,        setTask]        = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [manifest,    setManifest]    = useState<object | null>(null);

  async function loadSkills() {
    setLoading(true);
    try {
      const data = await fetch('/api/skills').then(r => r.json());
      if (data.skills) { setSkills(data.skills); setLoaded(true); }
    } finally { setLoading(false); }
  }

  async function matchTask() {
    if (!task.trim()) return;
    setLoading(true);
    try {
      const data = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      }).then(r => r.json());
      setMatchResult(data);
    } finally { setLoading(false); }
  }

  async function loadManifest() {
    setLoading(true);
    try {
      const data = await fetch('/api/skills?format=compact').then(r => r.json());
      setManifest(data);
    } finally { setLoading(false); }
  }

  const categories = ['all', ...new Set(skills.map(s => s.category))];
  const filtered   = skills.filter(s => {
    const catOk    = filter === 'all' || s.category === filter;
    const searchOk = !search || s.name.toLowerCase().includes(search.toLowerCase())
      || s.description.toLowerCase().includes(search.toLowerCase())
      || s.id.includes(search.toLowerCase());
    return catOk && searchOk;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚡</span>
            <h1 className="text-3xl font-black text-white">Skills</h1>
            {loaded && <span className="badge badge-accent">{skills.length} skills</span>}
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Capabilities that OpenClaw agents expose — discoverable by external platforms, agents, and orchestrators.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <button onClick={loadSkills} disabled={loading} className="btn btn-primary">
            {loading ? '⧗ Loading…' : loaded ? '↻ Reload' : '▶ Load Skills'}
          </button>
          <button onClick={loadManifest} disabled={loading} className="btn btn-ghost">
            📋 Compact Manifest
          </button>
          <a href="/api/skills" target="_blank" className="btn btn-ghost">
            🔗 JSON API
          </a>
          <a href="/skill.md" target="_blank" className="btn btn-ghost" style={{ color: 'var(--green)', borderColor: 'rgba(16,217,138,0.3)' }}>
            📄 skill.md
          </a>
        </div>

        {/* Skill Matcher */}
        <div className="card p-5 mb-6 animate-fade-up" style={{ animationDelay: '0.12s' }}>
          <p className="section-label mb-3">🎯 Skill Matcher</p>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="e.g. &lsquo;search the web for crypto news&rsquo; or &lsquo;run python script&rsquo;"
              value={task}
              onChange={e => setTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && matchTask()}
            />
            <button onClick={matchTask} disabled={loading || !task.trim()} className="btn btn-primary shrink-0">
              Match
            </button>
          </div>
          {matchResult?.suggestions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {matchResult.suggestions.length === 0
                ? <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No skills matched.</p>
                : matchResult.suggestions.map((s: any) => (
                    <div key={s.id} className="card px-3 py-2 text-xs flex items-center gap-2">
                      <span className="font-bold text-white">{s.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{s.endpoint}</span>
                      <span className={COST_BADGE[s.costEstimate]}>{s.costEstimate}</span>
                    </div>
                  ))
              }
            </div>
          )}
        </div>

        {/* Compact Manifest */}
        {manifest && (
          <div className="card p-5 mb-6" style={{ borderColor: 'rgba(124,92,252,0.3)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="section-label" style={{ color: '#a78bfa' }}>Compact Manifest</p>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(manifest, null, 2))}
                className="btn btn-ghost py-1 px-2 text-xs"
              >
                Copy JSON
              </button>
            </div>
            <pre className="mono text-xs overflow-auto max-h-60" style={{ color: 'var(--text-muted)' }}>
              {JSON.stringify(manifest, null, 2)}
            </pre>
          </div>
        )}

        {/* Filters */}
        {loaded && (
          <div className="flex flex-wrap gap-2 mb-5 items-center">
            <input
              className="input"
              style={{ maxWidth: '220px' }}
              placeholder="Search skills…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
                {cat === 'all' ? 'All' : `${CATEGORY_ICONS[cat] ?? '⚡'} ${cat}`}
              </button>
            ))}
          </div>
        )}

        {/* Skill Cards */}
        <div className="space-y-2">
          {filtered.map((skill, i) => (
            <div key={skill.id} className="card overflow-hidden animate-fade-up" style={{ animationDelay: `${0.04 * i}s` }}>
              <button
                onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}
                className="w-full text-left p-4 flex items-center gap-3 transition-colors"
                style={{ background: expanded === skill.id ? 'var(--bg-hover)' : 'transparent' }}
              >
                <span className="text-xl">{CATEGORY_ICONS[skill.category] ?? '⚡'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-bold text-white text-sm">{skill.name}</span>
                    <code className="text-[10px] mono" style={{ color: 'var(--text-muted)' }}>{skill.id}</code>
                    <span className={COST_BADGE[skill.costEstimate]}>{skill.costEstimate}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>~{skill.avgLatencyMs}ms</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{skill.description}</p>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{expanded === skill.id ? '▲' : '▼'}</span>
              </button>

              {expanded === skill.id && (
                <div className="px-5 pb-5 pt-3 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div>
                    <p className="section-label mb-2">Powered by</p>
                    <div className="flex gap-1 flex-wrap">
                      {skill.apiIds.map(api => (
                        <span key={api} className="badge badge-cyan mono">{api}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="section-label mb-2">Agent Types</p>
                    <div className="flex gap-1 flex-wrap">
                      {skill.agentTypes.map(t => (
                        <span key={t} className="badge badge-accent">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="section-label mb-2">Inputs</p>
                    <div className="space-y-1.5">
                      {skill.inputs.map(inp => (
                        <div key={inp.name} className="flex items-start gap-2 text-xs">
                          <code className="shrink-0 px-1.5 py-0.5 rounded mono"
                            style={{
                              background: inp.required ? 'rgba(124,92,252,0.15)' : 'var(--bg-hover)',
                              color:      inp.required ? '#a78bfa' : 'var(--text-muted)',
                            }}>
                            {inp.name}
                          </code>
                          <span style={{ color: 'var(--text-dim)' }}>{inp.type}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{inp.description}</span>
                          {inp.example && <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>e.g. {inp.example}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="section-label mb-2">Outputs</p>
                    <div className="space-y-1.5">
                      {skill.outputs.map(out => (
                        <div key={out.name} className="flex items-start gap-2 text-xs">
                          <code className="shrink-0 px-1.5 py-0.5 rounded mono"
                            style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
                            {out.name}
                          </code>
                          <span style={{ color: 'var(--text-dim)' }}>{out.type}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{out.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="section-label mb-2">Example Call</p>
                    <pre className="card p-3 mono text-xs overflow-auto" style={{ color: 'var(--green)' }}>
{skill.example.method} {skill.example.endpoint}{skill.example.body ? '\n' + JSON.stringify(skill.example.body, null, 2) : ''}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!loaded && !loading && (
          <div className="text-center py-20 animate-fade-up">
            <span className="text-5xl">⚡</span>
            <p className="mt-4 font-medium text-white">Click <strong>Load Skills</strong> to see all capabilities.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Or use the Skill Matcher to describe a task.</p>
          </div>
        )}
      </div>
    </div>
  );
}
