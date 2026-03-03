'use client';

import { useState, useEffect } from 'react';

interface Profile {
  walletAddress: string;
  displayName?: string;
  avatar?: string;
  theme: 'dark' | 'light' | 'auto';
  language: string;
  defaultAgent: string;
  notifications: { email: boolean; push: boolean; taskUpdates: boolean };
}

const DEFAULT_PROFILE: Profile = {
  walletAddress: '',
  theme: 'dark',
  language: 'en',
  defaultAgent: 'main',
  notifications: { email: false, push: true, taskUpdates: true },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.walletAddress) {
          setProfile(p => ({ ...p, walletAddress: data.walletAddress }));
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const shortAddr = profile.walletAddress
    ? `${profile.walletAddress.slice(0, 8)}...${profile.walletAddress.slice(-6)}`
    : '—';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">👤 Profile</h1>
        <p className="text-zinc-400 text-sm mt-1">Setatări cont generat din wallet</p>
      </div>

      {/* Wallet */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-4">Wallet</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-mono text-sm">{shortAddr}</p>
            <p className="text-zinc-500 text-xs mt-0.5">MultiversX Mainnet</p>
          </div>
          <span className="bg-green-900/40 text-green-400 border border-green-700 text-xs px-3 py-1 rounded-full">
            ✅ Conectat
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Deconectează wallet
          </button>
        </div>
      </section>

      {/* Display */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-4">Aparănță</h2>
        <div className="space-y-4">
          <div>
            <label className="text-zinc-300 text-sm block mb-1">Nume afişat (opional)</label>
            <input
              value={profile.displayName ?? ''}
              onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
              placeholder="e.g. CryptoBuilder.mvx"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-zinc-300 text-sm block mb-1">Temă</label>
            <select
              value={profile.theme}
              onChange={e => setProfile(p => ({ ...p, theme: e.target.value as Profile['theme'] }))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto (sistem)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Agent */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-4">Agent implicit</h2>
        <div className="flex items-center gap-3 bg-zinc-800/60 rounded-xl p-4">
          <div className="text-2xl">🤖</div>
          <div>
            <p className="text-white font-semibold">main</p>
            <p className="text-zinc-400 text-xs">OpenClaw agent principal</p>
          </div>
          <span className="ml-auto bg-cyan-900/40 text-cyan-400 border border-cyan-800 text-xs px-2 py-0.5 rounded-full">activ</span>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-4">Notificări</h2>
        <div className="space-y-3">
          {([
            { key: 'push', label: 'Push (browser)' },
            { key: 'email', label: 'Email' },
            { key: 'taskUpdates', label: 'Task updates' },
          ] as { key: keyof Profile['notifications']; label: string }[]).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-zinc-300 text-sm">{label}</span>
              <div
                onClick={() =>
                  setProfile(p => ({
                    ...p,
                    notifications: { ...p.notifications, [key]: !p.notifications[key] },
                  }))
                }
                className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                  profile.notifications[key] ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                    profile.notifications[key] ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-all"
      >
        {saving ? 'Se salvează...' : saved ? '✅ Salvat!' : 'Salvează setatările'}
      </button>
    </div>
  );
}
