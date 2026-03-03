'use client';

import { useState, useEffect, useMemo } from 'react';
import { NATIVE_PLUGINS, PLUGIN_CATEGORIES } from '@/lib/plugins/catalog';
import type { NativePlugin, PluginCategory } from '@/lib/plugins/types';

type InstallState = Record<string, 'idle' | 'configuring' | 'installed' | 'saving'>;

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<PluginCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [installState, setInstallState] = useState<InstallState>({});
  const [configuring, setConfiguring] = useState<NativePlugin | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = NATIVE_PLUGINS;
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.capabilities.some(c => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, search]);

  const handleInstall = (plugin: NativePlugin) => {
    if (plugin.configFields.length === 0) {
      // No config needed, install directly
      savePlugin(plugin, {}, {});
    } else {
      setConfiguring(plugin);
      setConfigValues({});
    }
  };

  const savePlugin = async (
    plugin: NativePlugin,
    config: Record<string, string>,
    secrets: Record<string, string>
  ) => {
    setSavingKey(plugin.key);
    try {
      const res = await fetch('/api/plugins/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginKey: plugin.key, config, secrets }),
      });
      if (res.ok) {
        setInstallState(s => ({ ...s, [plugin.key]: 'installed' }));
        setConfiguring(null);
        setConfigValues({});
      }
    } finally {
      setSavingKey(null);
    }
  };

  const handleConfigSave = () => {
    if (!configuring) return;
    const config: Record<string, string> = {};
    const secrets: Record<string, string> = {};
    for (const field of configuring.configFields) {
      const val = configValues[field.key] ?? '';
      if (field.isSecret) secrets[field.key] = val;
      else config[field.key] = val;
    }
    savePlugin(configuring, config, secrets);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🔌 Integrări & Pluginuri</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {NATIVE_PLUGINS.length} integrări native disponibile · Registry OpenClaw Skills
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-zinc-500">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Caută integrare (GitHub, Telegram, OpenAI…)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-cyan-500 text-black'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Toate ({NATIVE_PLUGINS.length})
        </button>
        {PLUGIN_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.key
                ? 'bg-cyan-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Plugin grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(plugin => {
          const state = installState[plugin.key] ?? 'idle';
          const isInstalled = state === 'installed';

          return (
            <div
              key={plugin.key}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{plugin.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{plugin.name}</h3>
                  <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">{plugin.description}</p>
                </div>
              </div>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-1">
                {plugin.capabilities.slice(0, 3).map(cap => (
                  <span
                    key={cap}
                    className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full"
                  >
                    {cap}
                  </span>
                ))}
                {plugin.capabilities.length > 3 && (
                  <span className="text-zinc-600 text-[10px] px-1">+{plugin.capabilities.length - 3}</span>
                )}
              </div>

              {/* Auth badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    plugin.authType === 'none'
                      ? 'border-green-800 text-green-400 bg-green-900/20'
                      : plugin.authType === 'oauth2'
                      ? 'border-blue-800 text-blue-400 bg-blue-900/20'
                      : 'border-yellow-800 text-yellow-400 bg-yellow-900/20'
                  }`}
                >
                  {plugin.authType === 'none' ? 'Free / No Key' : plugin.authType === 'oauth2' ? 'OAuth2' : 'API Key'}
                </span>
                {plugin.isOpenClawSkill && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-800 text-purple-400 bg-purple-900/20">
                    OpenClaw Skill
                  </span>
                )}
              </div>

              {/* Action */}
              <button
                onClick={() => handleInstall(plugin)}
                disabled={isInstalled || savingKey === plugin.key}
                className={`w-full py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  isInstalled
                    ? 'bg-green-900/30 text-green-400 border border-green-800 cursor-default'
                    : 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-800 hover:border-cyan-500'
                }`}
              >
                {savingKey === plugin.key ? 'Se instalează...' : isInstalled ? '✅ Instalat' : 'Instalează'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Config Modal */}
      {configuring && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{configuring.icon}</span>
              <div>
                <h3 className="text-white font-bold">{configuring.name}</h3>
                <p className="text-zinc-400 text-xs">{configuring.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {configuring.configFields.map(field => (
                <div key={field.key}>
                  <label className="text-zinc-300 text-sm block mb-1">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                    {field.isSecret && (
                      <span className="text-zinc-500 text-xs ml-2">🔒 criptat</span>
                    )}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={configValues[field.key] ?? ''}
                      onChange={e => setConfigValues(v => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'password' ? 'password' : 'text'}
                      value={configValues[field.key] ?? ''}
                      onChange={e => setConfigValues(v => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  )}
                </div>
              ))}
            </div>

            {configuring.docsUrl && (
              <a
                href={configuring.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 text-xs"
              >
                📖 Documentatie {configuring.name} →
              </a>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setConfiguring(null); setConfigValues({}); }}
                className="flex-1 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 py-2 rounded-xl text-sm transition-all"
              >
                Anulează
              </button>
              <button
                onClick={handleConfigSave}
                disabled={savingKey === configuring.key}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold py-2 rounded-xl text-sm transition-all"
              >
                {savingKey === configuring.key ? 'Se salvează...' : 'Salvează & Instalează'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
