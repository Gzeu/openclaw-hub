'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const PLUGIN_CATALOG = [
  { id: 'openrouter', name: 'OpenRouter', icon: '🤖', category: 'AI/LLM', desc: 'Acces la 100+ modele LLM prin OpenRouter API', free: true },
  { id: 'mistral', name: 'Mistral AI', icon: '🌬️', category: 'AI/LLM', desc: 'Modele Mistral Medium/Large pentru chat și analiză', free: true },
  { id: 'groq', name: 'Groq', icon: '⚡', category: 'AI/LLM', desc: 'Inferentă ultra-rapidă cu Llama 3 și Mixtral', free: true },
  { id: 'tavily', name: 'Tavily Search', icon: '🔍', category: 'Web Search', desc: 'Căutare web avansată pentru agenți AI', free: true },
  { id: 'jina', name: 'Jina Reader', icon: '📚', category: 'Web Scraping', desc: 'Extrage conținut din orice URL ca Markdown', free: true },
  { id: 'e2b', name: 'E2B Code', icon: '💻', category: 'Code', desc: 'Execuție cod Python/JS în sandbox securizat', free: true },
  { id: 'mvx', name: 'MultiversX', icon: '🔷', category: 'Blockchain', desc: 'Query balance, tranzacții și smart contracts', free: true },
  { id: 'coingecko', name: 'CoinGecko', icon: '🦎', category: 'Blockchain', desc: 'Prețuri crypto în timp real', free: true },
  { id: 'upstash', name: 'Upstash Redis', icon: '🗣️', category: 'Memory', desc: 'Memorie pe termen scurt și rate limiting', free: true },
  { id: 'qdrant', name: 'Qdrant', icon: '🧠', category: 'Memory', desc: 'Vector store pentru memorie semantică pe termen lung', free: true },
  { id: 'openmeteo', name: 'Open-Meteo', icon: '☁️', category: 'Data', desc: 'Prognoză meteo gratuită, fără API key', free: true },
  { id: 'wikipedia', name: 'Wikipedia', icon: '📖', category: 'Data', desc: 'Căutare și extragere articole Wikipedia', free: true },
  { id: 'github', name: 'GitHub API', icon: '🐛', category: 'Code', desc: 'Căutare repo-uri, issues, cod sursă', free: true },
];

const CATEGORIES = [...new Set(PLUGIN_CATALOG.map(p => p.category))];

export default function PluginsPage() {
  const [installed, setInstalled] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plugins/install')
      .then(r => r.ok ? r.json() : { installed: [] })
      .then(data => {
        setInstalled((data.installed ?? []).map((p: { id: string }) => p.id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = async (pluginId: string) => {
    const isInstalled = installed.includes(pluginId);
    const method = isInstalled ? 'DELETE' : 'POST';
    const res = await fetch('/api/plugins/install', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pluginId }),
    });
    if (res.ok) {
      setInstalled(prev =>
        isInstalled ? prev.filter(id => id !== pluginId) : [...prev, pluginId]
      );
    }
  };

  const filtered = activeCategory === 'All'
    ? PLUGIN_CATALOG
    : PLUGIN_CATALOG.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="text-4xl">🧩</div>
        <div>
          <h1 className="text-2xl font-bold text-white">Plugins</h1>
          <p className="text-zinc-400 text-sm">Activează integrari pentru agenții tăi</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === cat
                ? 'bg-cyan-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Plugin grid */}
      {loading ? (
        <div className="text-zinc-500 text-sm">⏳ Se încarcă...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(plugin => {
            const active = installed.includes(plugin.id);
            return (
              <div
                key={plugin.id}
                className={`bg-zinc-900 border rounded-2xl p-5 flex items-start gap-4 transition-all ${
                  active ? 'border-cyan-500/50' : 'border-zinc-800'
                }`}
              >
                <div className="text-3xl shrink-0">{plugin.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{plugin.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{plugin.category}</span>
                    {plugin.free && <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/40 text-green-400">Free</span>}
                  </div>
                  <p className="text-zinc-500 text-xs mt-1">{plugin.desc}</p>
                </div>
                <button
                  onClick={() => toggle(plugin.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-red-900/20 hover:text-red-400'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-cyan-500 hover:text-black'
                  }`}
                >
                  {active ? 'Activ' : 'Instalează'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-4 text-xs text-zinc-600">
        <span>{installed.length} plugin-uri active</span>
        <Link href="/settings" className="text-cyan-500 hover:underline">→ Configurează API keys</Link>
        <Link href="/profile" className="text-cyan-500 hover:underline">→ Profil</Link>
      </div>
    </div>
  );
}
