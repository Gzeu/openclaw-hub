'use client';

import { useState } from 'react';

interface SkillInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}
interface SkillOutput {
  name: string;
  type: string;
  description: string;
}
interface SkillDef {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: SkillInput[];
  outputs: SkillOutput[];
  apiIds: string[];
  example: { endpoint: string; method: string; body?: object };
  costEstimate: string;
  avgLatencyMs: number;
  agentTypes: string[];
  version: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  ai: '🤖',
  search: '🔍',
  code: '💻',
  blockchain: '🔗',
  data: '📊',
  content: '🌐',
  economy: '💰',
  utility: '🛠️',
};

const COST_COLORS: Record<string, string> = {
  free: 'text-green-400 border-green-900',
  low: 'text-blue-400 border-blue-900',
  medium: 'text-yellow-400 border-yellow-900',
  high: 'text-red-400 border-red-900',
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [task, setTask] = useState('');
  const [matchResult, setMatchResult] = useState<object | null>(null);
  const [manifest, setManifest] = useState<object | null>(null);

  async function loadSkills() {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.skills) { setSkills(data.skills); setLoaded(true); }
    } finally { setLoading(false); }
  }

  async function matchTask() {
    if (!task.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      });
      const data = await res.json();
      setMatchResult(data);
    } finally { setLoading(false); }
  }

  async function loadManifest() {
    setLoading(true);
    try {
      const res = await fetch('/api/skills?format=compact');
      const data = await res.json();
      setManifest(data);
    } finally { setLoading(false); }
  }

  const categories = ['all', ...new Set(skills.map((s) => s.category))];
  const filtered = skills.filter((s) => {
    const catOk = filter === 'all' || s.category === filter;
    const searchOk =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search.toLowerCase());
    return catOk && searchOk;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">⚡ OpenClaw Skills</h1>
        <p className="text-gray-400 text-sm mb-6">
          Capabilities that OpenClaw agents can offer — discoverable by external platforms, other agents, and orchestrators.
        </p>

        {/* Action bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={loadSkills}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
          >
            {loading ? 'Loading…' : loaded ? '↻ Reload Skills' : '▶ Load Skills'}
          </button>
          <button
            onClick={loadManifest}
            disabled={loading}
            className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
          >
            📋 Compact Manifest (for agents)
          </button>
          <a
            href="/api/skills"
            target="_blank"
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium border border-gray-700"
          >
            🔗 JSON API
          </a>
          <a
            href="/skill.md"
            target="_blank"
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium border border-green-800 text-green-400"
          >
            📄 skill.md
          </a>
        </div>

        {/* Task matcher */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-6">
          <p className="text-xs text-gray-400 mb-2 font-medium">🎯 Skill Matcher — describe a task, find the right skill</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 'search the web for latest crypto news' or 'run this python script'"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && matchTask()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={matchTask}
              disabled={loading || !task.trim()}
              className="bg-green-700 hover:bg-green-800 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
            >
              Match
            </button>
          </div>
          {matchResult && (
            <div className="mt-3">
              {(matchResult as { suggestions?: Array<{ id: string; name: string; score: number; costEstimate: string; avgLatencyMs: number; endpoint: string }> }).suggestions?.length === 0 ? (
              <p className="text-xs text-gray-500">No skills matched. Try different keywords.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(matchResult as { suggestions: Array<{ id: string; name: string; score: number; costEstimate: string; avgLatencyMs: number; endpoint: string }> }).suggestions?.map((s) => (
                  <div key={s.id} className="bg-gray-800 rounded px-3 py-1.5 text-xs">
                    <span className="font-medium text-white">{s.name}</span>
                    <span className="text-gray-500 ml-1">({s.endpoint})</span>
                    <span className={`ml-2 ${COST_COLORS[s.costEstimate]}`}>{s.costEstimate}</span>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}
        </div>

        {/* Compact manifest preview */}
        {manifest && (
          <div className="bg-gray-900 rounded-lg p-4 border border-purple-900 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-purple-400">Compact Manifest (send this to other agents)</h3>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(manifest, null, 2))}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Copy JSON
              </button>
            </div>
            <pre className="text-xs text-gray-300 overflow-auto max-h-60">{JSON.stringify(manifest, null, 2)}</pre>
          </div>
        )}

        {/* Filters */}
        {loaded && (
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <input
              type="text"
              placeholder="Search skills…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm w-52"
            />
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
                {cat === 'all' ? 'All' : `${CATEGORY_ICONS[cat] ?? ''} ${cat}`}
              </button>
            ))}
          </div>
        )}

        {/* Skill cards */}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((skill) => (
              <div
                key={skill.id}
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}
                  className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-xl">{CATEGORY_ICONS[skill.category] ?? '⚡'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{skill.name}</span>
                      <code className="text-xs text-gray-500 font-mono">{skill.id}</code>
                      <span className={`text-xs px-2 py-0.5 rounded border ${COST_COLORS[skill.costEstimate]}`}>
                        {skill.costEstimate}
                      </span>
                      <span className="text-xs text-gray-600">~{skill.avgLatencyMs}ms</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5 truncate">{skill.description}</p>
                  </div>
                  <span className="text-gray-600 text-sm">{expanded === skill.id ? '▲' : '▼'}</span>
                </button>

                {expanded === skill.id && (
                  <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-4">
                    {/* APIs */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Powered by APIs</p>
                      <div className="flex gap-1 flex-wrap">
                        {skill.apiIds.map((api) => (
                          <span key={api} className="text-xs bg-gray-800 text-blue-400 px-2 py-0.5 rounded font-mono">{api}</span>
                        ))}
                      </div>
                    </div>

                    {/* Agent types */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Agent Types</p>
                      <div className="flex gap-1 flex-wrap">
                        {skill.agentTypes.map((t) => (
                          <span key={t} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Inputs</p>
                      <div className="space-y-1">
                        {skill.inputs.map((inp) => (
                          <div key={inp.name} className="flex items-start gap-2 text-xs">
                            <code className={`shrink-0 px-1.5 py-0.5 rounded font-mono ${
                              inp.required ? 'bg-blue-950 text-blue-300' : 'bg-gray-800 text-gray-400'
                            }`}>{inp.name}</code>
                            <span className="text-gray-500">{inp.type}</span>
                            <span className="text-gray-400">{inp.description}</span>
                            {inp.example && <span className="text-gray-600 italic">e.g. {inp.example}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Outputs */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Outputs</p>
                      <div className="space-y-1">
                        {skill.outputs.map((out) => (
                          <div key={out.name} className="flex items-start gap-2 text-xs">
                            <code className="shrink-0 px-1.5 py-0.5 rounded font-mono bg-green-950 text-green-300">{out.name}</code>
                            <span className="text-gray-500">{out.type}</span>
                            <span className="text-gray-400">{out.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Example Call</p>
                      <pre className="text-xs bg-gray-800 rounded p-2 overflow-auto">
{skill.example.method} {skill.example.endpoint}
{skill.example.body ? JSON.stringify(skill.example.body, null, 2) : ''}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loaded && !loading && (
          <div className="text-center text-gray-500 py-16">
            <p className="text-4xl mb-3">⚡</p>
            <p>Click <strong>Load Skills</strong> to see all capabilities.</p>
            <p className="text-sm mt-1">Or use the Skill Matcher above to describe a task.</p>
          </div>
        )}
      </div>
    </div>
  );
}
