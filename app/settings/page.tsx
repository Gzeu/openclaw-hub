'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_KEYS_CONFIG = [
  { id: 'OPENROUTER_API_KEY', label: 'OpenRouter', icon: '🤖', placeholder: 'sk-or-...', docs: 'https://openrouter.ai/keys' },
  { id: 'MISTRAL_API_KEY', label: 'Mistral AI', icon: '🌬️', placeholder: 'mistral-...', docs: 'https://console.mistral.ai' },
  { id: 'GROQ_API_KEY', label: 'Groq', icon: '⚡', placeholder: 'gsk_...', docs: 'https://console.groq.com' },
  { id: 'TAVILY_API_KEY', label: 'Tavily Search', icon: '🔍', placeholder: 'tvly-...', docs: 'https://tavily.com' },
  { id: 'E2B_API_KEY', label: 'E2B Code', icon: '💻', placeholder: 'e2b_...', docs: 'https://e2b.dev' },
  { id: 'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID', label: 'WalletConnect Project ID', icon: '🔷', placeholder: 'abc123...', docs: 'https://cloud.walletconnect.com' },
  { id: 'UPSTASH_REDIS_REST_URL', label: 'Upstash Redis URL', icon: '🗣️', placeholder: 'https://...upstash.io', docs: 'https://upstash.com' },
  { id: 'UPSTASH_REDIS_REST_TOKEN', label: 'Upstash Redis Token', icon: '🗣️', placeholder: 'AX4A...', docs: 'https://upstash.com' },
];

const MODEL_OPTIONS = [
  { value: 'mistral-medium-latest', label: 'Mistral Medium (default)' },
  { value: 'mistral-large-latest', label: 'Mistral Large' },
  { value: 'openai/gpt-4o', label: 'GPT-4o (via OpenRouter)' },
  { value: 'google/gemini-pro', label: 'Gemini Pro (via OpenRouter)' },
  { value: 'meta-llama/llama-3-70b-instruct', label: 'Llama 3 70B (via Groq)' },
];

type Tab = 'apikeys' | 'model' | 'general';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('apikeys');
  const [savedModel, setSavedModel] = useState('mistral-medium-latest');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveModel = () => {
    localStorage.setItem('openclaw_default_model', savedModel);
    setSavedMsg('Salvat!');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="text-4xl">⚙️</div>
        <div>
          <h1 className="text-2xl font-bold text-white">Setări</h1>
          <p className="text-zinc-400 text-sm">Configurează API keys, modele și preferințe</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        {(['apikeys', 'model', 'general'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? 'border-cyan-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'apikeys' && '🔑 API Keys'}
            {tab === 'model' && '🤖 Model'}
            {tab === 'general' && '🛠️ General'}
          </button>
        ))}
      </div>

      {activeTab === 'apikeys' && (
        <div className="space-y-4">
          <p className="text-zinc-500 text-sm">
            API key-urile sunt stocate <strong className="text-zinc-300">exclusiv în Vercel Environment Variables</strong>.
            Modifică-le din{' '}
            <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Vercel Dashboard</a>
            {' '}→ Project → Settings → Environment Variables.
          </p>
          <div className="space-y-3">
            {API_KEYS_CONFIG.map(key => (
              <div key={key.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <span className="text-2xl">{key.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{key.label}</span>
                    <code className="text-xs text-zinc-500">{key.id}</code>
                  </div>
                  <div className="font-mono text-xs text-zinc-600 mt-1">{key.placeholder}</div>
                </div>
                <a href={key.docs} target="_blank" rel="noreferrer" className="text-xs text-cyan-500 hover:underline shrink-0">Docs ↗</a>
              </div>
            ))}
          </div>
          <div className="bg-zinc-900 border border-amber-800/50 rounded-xl p-4">
            <p className="text-amber-400 text-xs">
              ⚠️ API key-urile nu pot fi vizualizate sau editate din browser din motive de securitate.
              Setează-le în Vercel → Environment Variables, apoi redeploy.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'model' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Model implicit pentru Chat</h2>
            <select
              value={savedModel}
              onChange={e => setSavedModel(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
            >
              {MODEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button onClick={handleSaveModel} className="btn btn-primary text-sm py-2 px-6">
              {savedMsg || 'Salvează'}
            </button>
            <p className="text-zinc-500 text-xs">Salvat local în browser (localStorage). Aplicat din /chat.</p>
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Acces rapid</h2>
            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-all">
              <span>👤</span><div><div className="text-sm text-white">Profil și API Key</div><div className="text-xs text-zinc-500">Adresă wallet, copiază API key</div></div>
              <span className="ml-auto text-zinc-600">→</span>
            </Link>
            <Link href="/plugins" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-all">
              <span>🧩</span><div><div className="text-sm text-white">Plugins</div><div className="text-xs text-zinc-500">Integrări active</div></div>
              <span className="ml-auto text-zinc-600">→</span>
            </Link>
            <Link href="/economy" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-all">
              <span>💸</span><div><div className="text-sm text-white">Economy</div><div className="text-xs text-zinc-500">Budget EGLD</div></div>
              <span className="ml-auto text-zinc-600">→</span>
            </Link>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Platformă</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Versiune</span><span className="text-white font-mono">v0.3.0</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Network</span><span className="text-cyan-400">MultiversX Mainnet</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">API</span><a href="/api/skills" target="_blank" className="text-cyan-400 hover:underline">/api/skills</a></div>
              <div className="flex justify-between"><span className="text-zinc-500">Manifest</span><a href="/skill.md" target="_blank" className="text-cyan-400 hover:underline">/skill.md</a></div>
              <div className="flex justify-between"><span className="text-zinc-500">GitHub</span><a href="https://github.com/Gzeu/openclaw-hub" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Gzeu/openclaw-hub</a></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
