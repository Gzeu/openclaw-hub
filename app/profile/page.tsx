'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  User, Wallet, Key, Coins, ShieldCheck, Activity, Settings as SettingsIcon,
  Puzzle, Copy, Check, LogOut, ExternalLink, Zap, Clock, Bot, Wrench
} from 'lucide-react';

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
    fetch('/api/profile', { credentials: 'include' })
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div className="text-zinc-400 text-sm animate-pulse font-medium">⏳ Se încarcă profilul...</div>
        </div>
      </div>
    );
  }

  if (!profile?.mxAddress) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center space-y-8">
          <div className="mx-auto w-20 h-20 bg-zinc-800/50 rounded-2xl flex items-center justify-center text-4xl">🔒</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Sesiune expirată</h2>
            <p className="text-zinc-400">Autentifică-te pentru a accesa centrul de comandă OpenClaw.</p>
          </div>
          <Link href="/login" className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all">
            Conectează-te acum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-10">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl border border-cyan-500/30 flex items-center justify-center shadow-lg">
            <User size={48} className="text-cyan-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Profil Utilizator
              <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Verified</div>
            </h1>
            <p className="text-zinc-400 font-medium">Centrul de identitate și management OpenClaw Hub</p>
            <div className="flex items-center gap-4 pt-2 text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5"><Clock size={14} /> Membru din: {new Date(profile.createdAt || Date.now()).toLocaleDateString('ro-RO')}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> Securitate: Activă</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/settings" className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm font-semibold hover:bg-zinc-800 transition-all">
            <SettingsIcon size={16} /> Setări
          </Link>
          <button onClick={handleLogout} className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Address */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet size={120} className="text-cyan-400" />
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Wallet size={18} className="text-cyan-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest font-mono">MultiversX Network Identity</h2>
            </div>
            <div className="space-y-4">
              <div className="font-mono text-sm lg:text-base text-cyan-400/90 break-all bg-black/40 border border-zinc-800/80 rounded-2xl px-5 py-4 shadow-inner">
                {profile.mxAddress}
              </div>
              <div className="flex items-center gap-4 pl-1">
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-bold"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Mainnet Online</span>
                <span className="text-zinc-800">|</span>
                <a href={`https://explorer.multiversx.com/accounts/${profile.mxAddress}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white uppercase tracking-wider font-bold transition-colors">
                  Explorer <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </section>

          {/* API Key */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <Key size={18} className="text-yellow-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest font-mono">M2M Authenticator (API Key)</h2>
              </div>
              <div className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] uppercase tracking-widest text-yellow-500 font-bold">Secret</div>
            </div>
            {profile.apiKey ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 font-mono text-xs text-zinc-400 break-all bg-black/40 border border-zinc-800/80 rounded-2xl px-5 py-4 select-all shadow-inner">
                    {profile.apiKey}
                  </div>
                  <button onClick={copyApiKey} className={`w-14 shrink-0 flex items-center justify-center rounded-2xl border transition-all ${ copied ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-white' }`}>
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    <strong className="text-zinc-300">Securitate:</strong> Header pentru apeluri API automate.
                    <code className="text-cyan-400 px-1 rounded bg-black/20 ml-1">x-api-key: [key]</code>
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 text-sm">API Key indisponibil în această sesiune.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right - Stats & Nav */}
        <div className="space-y-6">
          {/* Budget */}
          <section className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-cyan-950/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10"><Coins size={140} /></div>
            <div className="relative space-y-6">
              <div className="flex items-center gap-2">
                <Coins size={20} />
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">Workspace Balance</h3>
              </div>
              <div>
                <div className="text-5xl font-black tracking-tight">{profile.budget ?? 0}</div>
                <div className="text-sm font-bold opacity-70 uppercase tracking-widest mt-1">EGLD Credits</div>
              </div>
              <Link href="/economy" className="w-full inline-flex items-center justify-center gap-2 py-3 bg-black/20 hover:bg-black/30 border border-white/10 rounded-xl text-sm font-bold transition-all">
                Top-up Balance <Zap size={14} className="fill-current" />
              </Link>
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 space-y-1">
              <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Agents</div>
              <div className="text-xl font-bold text-white">0</div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 space-y-1">
              <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Tasks</div>
              <div className="text-xl font-bold text-white">0</div>
            </div>
          </div>

          {/* Quick Nav — toate paginile importante */}
          <section className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-zinc-400">🗣️ Scurtături Dashboard</h2>
            <nav className="flex flex-col gap-1.5">
              <Link href="/agents" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all text-sm font-medium">
                <Bot size={16} className="text-violet-400" /> Agenți AI
              </Link>
              <Link href="/wallet" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all text-sm font-medium">
                <Coins size={16} className="text-cyan-400" /> Portofel Digital
              </Link>
              <Link href="/plugins" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all text-sm font-medium">
                <Puzzle size={16} className="text-purple-400" /> Catalog Plugin-uri
              </Link>
              <Link href="/activity" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all text-sm font-medium">
                <Activity size={16} className="text-green-400" /> Activitate Rețea
              </Link>
              <Link href="/config" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all text-sm font-medium">
                <Wrench size={16} className="text-amber-400" /> Configurație & API Keys
              </Link>
              <Link href="/settings/integrations" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all text-sm font-medium">
                <SettingsIcon size={16} className="text-zinc-400" /> Integrări avansate
              </Link>
            </nav>
          </section>
        </div>
      </div>
    </div>
  );
}
