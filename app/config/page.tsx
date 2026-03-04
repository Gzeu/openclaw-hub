'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ConfigPage() {
  const router = useRouter()
  const [address, setAddress] = useState<string | null>(null)
  const [settings, setSettings] = useState<any>({ theme: 'dark', language: 'ro' })
  const [providers, setProviders] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddKeyModal, setShowAddKeyModal] = useState(false)
  const [newKey, setNewKey] = useState({ providerId: '', keyName: '', apiKey: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Auth via cookie session (xPortal NativeAuth flow)
      const meRes = await fetch('/api/auth/me', { credentials: 'include' })
      if (!meRes.ok) {
        router.push('/login?from=/config')
        return
      }
      const me = await meRes.json()
      setAddress(me.address)

      // Settings
      const settingsRes = await fetch('/api/config/settings', { credentials: 'include' })
      if (settingsRes.ok) {
        const d = await settingsRes.json()
        setSettings(d.settings ?? { theme: 'dark', language: 'ro' })
      }

      // AI Providers
      const providersRes = await fetch('/api/config/providers', { credentials: 'include' })
      if (providersRes.ok) {
        const d = await providersRes.json()
        setProviders(d.providers ?? [])
      }

      // API Keys
      const keysRes = await fetch('/api/config/apikeys', { credentials: 'include' })
      if (keysRes.ok) {
        const d = await keysRes.json()
        setApiKeys(d.apiKeys ?? [])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (next: any) => {
    setSettings(next)
    await fetch('/api/config/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(next),
    })
  }

  const addApiKey = async () => {
    if (!newKey.providerId || !newKey.keyName || !newKey.apiKey) return
    const res = await fetch('/api/config/apikeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newKey),
    })
    if (res.ok) { setShowAddKeyModal(false); setNewKey({ providerId: '', keyName: '', apiKey: '' }); fetchData() }
  }

  const toggleKey = async (keyId: string) => {
    await fetch('/api/config/apikeys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ keyId }),
    })
    fetchData()
  }

  const deleteKey = async (keyId: string) => {
    await fetch('/api/config/apikeys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ keyId }),
    })
    fetchData()
  }

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Se încarcă configurația...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-4xl">⚠️</p>
        <p className="text-red-400">{error}</p>
        <button onClick={() => router.push('/login?from=/config')} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm">Login</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⚙️ Configuration</h1>
          <p className="text-zinc-400 text-sm mt-1">Setări cont, API keys și preferințe</p>
        </div>
        <div className="flex gap-3">
          <Link href="/profile" className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors">👤 Profil</Link>
          <Link href="/settings/integrations" className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors">🔌 Integrări</Link>
        </div>
      </div>

      {/* Identity */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">🔑 Identitate MultiversX</h2>
        <div className="font-mono text-sm text-cyan-400 bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 break-all">
          {address}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Mainnet · xPortal Auth</span>
          <a href={`https://explorer.multiversx.com/accounts/${address}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">→ Explorer</a>
        </div>
      </section>

      {/* Settings */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">🎨 Preferințe</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Temă</label>
            <select value={settings.theme} onChange={e => updateSettings({ ...settings, theme: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
              <option value="dark">🌙 Dark</option>
              <option value="light">☀️ Light</option>
              <option value="auto">🌓 Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Limbă</label>
            <select value={settings.language} onChange={e => updateSettings({ ...settings, language: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
              <option value="ro">🇷🇴 Română</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>
        </div>
      </section>

      {/* AI Providers */}
      {providers.length > 0 && (
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">🤖 AI Providers</h2>
          <div className="space-y-2">
            {providers.map((p: any) => (
              <div key={p._id} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.type} · {p.supportedModels?.join(', ')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${ p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400' }`}>
                  {p.isActive ? 'Activ' : 'Inactiv'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* API Keys */}
      <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">🗝️ API Keys</h2>
          <button onClick={() => setShowAddKeyModal(true)}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg transition-colors">+ Adaugă</button>
        </div>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-zinc-700 rounded-xl">
            <p className="text-zinc-500 text-sm">Niciun API key configurat</p>
            <p className="text-zinc-600 text-xs mt-1">Adaugă chei pentru a folosi provideri AI</p>
          </div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((k: any) => (
              <div key={k.id} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{k.keyName}</p>
                  <p className="text-xs text-zinc-500">Provider: {k.providerId} · {new Date(k.createdAt).toLocaleDateString('ro-RO')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg ${ k.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400' }`}>
                    {k.isActive ? 'Activ' : 'Inactiv'}
                  </span>
                  <button onClick={() => toggleKey(k.id)} className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors">
                    {k.isActive ? 'Dezactivează' : 'Activează'}
                  </button>
                  <button onClick={() => deleteKey(k.id)} className="text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 text-xs">
        <Link href="/agents" className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors">🤖 Agenți</Link>
        <Link href="/plugins" className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors">🧩 Plugins</Link>
        <Link href="/settings/integrations" className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors">🔌 Integrări avansate</Link>
        <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }}
          className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">🚪 Logout</button>
      </div>

      {/* Add Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Adaugă API Key</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Provider</label>
                <select value={newKey.providerId} onChange={e => setNewKey({ ...newKey, providerId: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="">-- alege --</option>
                  {providers.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  <option value="openai">OpenAI</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="perplexity">Perplexity</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nume cheie</label>
                <input value={newKey.keyName} onChange={e => setNewKey({ ...newKey, keyName: e.target.value })}
                  placeholder="ex: My OpenAI Key"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">API Key</label>
                <input type="password" value={newKey.apiKey} onChange={e => setNewKey({ ...newKey, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addApiKey} disabled={!newKey.providerId || !newKey.keyName || !newKey.apiKey}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">Salvează</button>
              <button onClick={() => { setShowAddKeyModal(false); setNewKey({ providerId: '', keyName: '', apiKey: '' }) }}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-xl transition-colors">Anulează</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
