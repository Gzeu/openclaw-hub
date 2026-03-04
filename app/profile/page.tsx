'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProfileData {
  mxAddress?: string;
  apiKey?: string;
  budget?: number;
  createdAt?: number;
  username?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const copyApiKey = () => {
    if (profile?.apiKey) {
      navigator.clipboard.writeText(profile.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400 text-sm">⏳ Se încarcă profilul...</div>
      </div>
    );
  }

  if (!profile?.mxAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <p className="text-zinc-300">Sesiune expirată</p>
          <Link href="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <div className="text-4xl">👤</div>
        <div>
          <h1 className="text-2xl font-bold text-white">Profil</h1>
          <p className="text-zinc-400 text-sm">Identitatea ta în OpenClaw Hub</p>
        </div>
      </div>

      {/* Wallet card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">🔷 Portofel MultiversX</h2>
        <div className="font-mono text-cyan-400 text-sm break-all bg-zinc-800 rounded-xl px-4 py-3">
          {profile.mxAddress}
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>MultiversX Mainnet</span>
          <span>·</span>
          <span>WalletConnect v2</span>
          <span>·</span>
          <span>Native Auth</span>
        </div>
      </div>

      {/* API Key card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">🔑 API Key (M2M)</h2>
        {profile.apiKey ? (
          <>
            <div className="font-mono text-xs text-zinc-300 break-all bg-zinc-800 rounded-xl px-4 py-3 select-all">
              {profile.apiKey}
            </div>
            <button
              onClick={copyApiKey}
              className="btn btn-ghost text-xs py-1.5 px-4"
            >
              {copied ? '✅ Copiat!' : '📋 Copiază'}
            </button>
            <p className="text-zinc-500 text-xs">
              Folosit pentru accesul M2M: <code className="text-cyan-400">x-api-key: {'<apiKey>'}</code>
            </p>
          </>
        ) : (
          <p className="text-zinc-500 text-sm">API Key indisponibil. Încercă să te reconectezi.</p>
        )}
      </div>

      {/* Budget card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-2">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">💰 Budget</h2>
        <div className="text-2xl font-bold text-white">
          {profile.budget ?? 0} <span className="text-zinc-400 text-base font-normal">EGLD</span>
        </div>
        <Link href="/economy" className="text-cyan-400 text-xs hover:underline">
          → Adaugă fonduri în Economy
        </Link>
      </div>

      {/* Quick links */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">⚡ Acces rapid</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/settings" className="btn btn-ghost text-sm py-2 justify-start gap-2">
            ⚙️ Settings
          </Link>
          <Link href="/plugins" className="btn btn-ghost text-sm py-2 justify-start gap-2">
            🧩 Plugins
          </Link>
          <Link href="/wallet" className="btn btn-ghost text-sm py-2 justify-start gap-2">
            💎 Wallet
          </Link>
          <Link href="/activity" className="btn btn-ghost text-sm py-2 justify-start gap-2">
            📡 Activity
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="btn text-xs py-2 px-4 border border-red-800 text-red-400 hover:bg-red-900/20 rounded-xl transition-all"
        >
          🚪 Deconectează-te
        </button>
      </div>
    </div>
  );
}
