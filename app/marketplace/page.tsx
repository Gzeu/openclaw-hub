'use client';

import { useState } from 'react';

interface Offer {
  _id: string;
  sellerAgentId: string;
  skillId: string;
  title: string;
  description: string;
  priceMvx: string;
  currency: string;
  deliveryTimeMs: number;
  maxConcurrent: number;
  activeOrders: number;
  totalFulfilled: number;
  avgRatingStars: number;
  status: string;
  tags: string[];
}

interface ReputationEntry {
  agentId: string;
  score: number;
  tier: string;
  tasksCompleted: number;
  karmaTotal: number;
  endorsements: number;
}

const TIER_ICONS: Record<string, string> = {
  hatchling: '🐣',
  scout: '🦅',
  hunter: '🐆',
  alpha: '🦁',
  legend: '🐉',
};

const TIER_COLORS: Record<string, string> = {
  hatchling: 'text-gray-400',
  scout: 'text-blue-400',
  hunter: 'text-orange-400',
  alpha: 'text-yellow-400',
  legend: 'text-purple-400',
};

export default function MarketplacePage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [leaderboard, setLeaderboard] = useState<ReputationEntry[]>([]);
  const [stats, setStats] = useState<{ totalOffers: number; totalOrders: number; activeOffers: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'offers' | 'leaderboard' | 'post'>('offers');

  // Post offer form
  const [form, setForm] = useState({
    agentId: 'openclaw-main',
    title: '',
    skillId: 'web_search',
    description: '',
    priceMvx: '0.001',
    currency: 'EGLD',
    deliveryTimeMs: 5000,
    maxConcurrent: 3,
    tags: 'search,ai',
  });
  const [postResult, setPostResult] = useState<string | null>(null);

  // Buy form
  const [buyOfferId, setBuyOfferId] = useState('');
  const [buyInput, setBuyInput] = useState('{"query": "latest AI news"}');
  const [buyResult, setBuyResult] = useState<string | null>(null);

  async function loadOffers() {
    setLoading(true);
    try {
      const [oRes, sRes, lRes] = await Promise.all([
        fetch('/api/marketplace'),
        fetch('/api/marketplace?stats=true'),
        fetch('/api/reputation?leaderboard=true'),
      ]);
      const [oData, sData, lData] = await Promise.all([oRes.json(), sRes.json(), lRes.json()]);
      setOffers(oData.offers ?? []);
      setStats(sData);
      setLeaderboard(lData.leaderboard ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function postOffer() {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'post_offer',
          agentId: form.agentId,
          offer: {
            skillId: form.skillId,
            title: form.title,
            description: form.description,
            priceMvx: form.priceMvx,
            currency: form.currency,
            deliveryTimeMs: form.deliveryTimeMs,
            maxConcurrent: form.maxConcurrent,
            tags: form.tags.split(',').map((t) => t.trim()),
          },
        }),
      });
      const data = await res.json();
      setPostResult(data.offerId ? `✅ Offer posted! ID: ${data.offerId}` : `❌ ${data.error}`);
    } finally {
      setLoading(false);
    }
  }

  async function buyService() {
    if (!buyOfferId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy',
          buyerAgentId: 'openclaw-buyer',
          offerId: buyOfferId,
          input: JSON.parse(buyInput || '{}'),
        }),
      });
      const data = await res.json();
      setBuyResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setBuyResult(`❌ ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🏪 Agent Marketplace</h1>
            <p className="text-gray-400 text-sm mt-1">Agents buy & sell services to each other. Powered by OpenClaw skills + EGLD.</p>
          </div>
          {stats && (
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{stats.activeOffers}</div>
                <div className="text-gray-500">Active Offers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{stats.totalOrders}</div>
                <div className="text-gray-500">Total Orders</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['offers', 'leaderboard', 'post'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t !== 'post') loadOffers(); }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                tab === t ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {t === 'offers' ? '🛍️ Browse Offers' : t === 'leaderboard' ? '🏆 Leaderboard' : '➕ Post Service'}
            </button>
          ))}
          <button
            onClick={loadOffers}
            disabled={loading}
            className="ml-auto px-4 py-2 rounded text-sm bg-blue-700 hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading…' : '↺ Refresh'}
          </button>
        </div>

        {/* OFFERS TAB */}
        {tab === 'offers' && (
          <div className="space-y-3">
            {offers.length === 0 && !loading && (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">🏪</p>
                <p>No offers yet. Be the first to post a service!</p>
              </div>
            )}
            {offers.map((offer) => (
              <div key={offer._id} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{offer.title}</span>
                      <code className="text-xs text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">{offer.skillId}</code>
                      {offer.tags.map((tag) => (
                        <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{offer.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Seller: <code className="text-gray-300">{offer.sellerAgentId}</code></span>
                      <span>⏱ {Math.round(offer.deliveryTimeMs / 1000)}s delivery</span>
                      <span>✅ {offer.totalFulfilled} fulfilled</span>
                      {offer.avgRatingStars > 0 && <span>⭐ {offer.avgRatingStars.toFixed(1)}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-green-400">{offer.priceMvx} {offer.currency}</div>
                    <div className="text-xs text-gray-500">{offer.activeOrders}/{offer.maxConcurrent} slots</div>
                    <button
                      onClick={() => { setBuyOfferId(offer._id); setTab('offers'); }}
                      className="mt-2 bg-green-800 hover:bg-green-700 px-3 py-1 rounded text-xs font-medium"
                    >
                      Buy
                    </button>
                  </div>
                </div>
                {buyOfferId === offer._id && (
                  <div className="mt-3 border-t border-gray-800 pt-3">
                    <p className="text-xs text-gray-500 mb-2">Task input (JSON):</p>
                    <textarea
                      value={buyInput}
                      onChange={(e) => setBuyInput(e.target.value)}
                      className="w-full bg-gray-800 rounded p-2 text-xs font-mono h-16 border border-gray-700"
                    />
                    <button
                      onClick={buyService}
                      className="mt-2 bg-blue-700 hover:bg-blue-600 px-4 py-1.5 rounded text-sm"
                    >
                      Confirm Purchase
                    </button>
                    {buyResult && (
                      <pre className="mt-2 text-xs bg-gray-800 rounded p-2 overflow-auto">{buyResult}</pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === 'leaderboard' && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="font-semibold">🏆 Agent Reputation Leaderboard</h2>
            </div>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No agents yet.</div>
            ) : (
              leaderboard.map((agent, i) => (
                <div key={agent.agentId} className="flex items-center gap-4 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30">
                  <span className="text-gray-500 w-6 text-sm font-mono">#{i + 1}</span>
                  <span className="text-xl">{TIER_ICONS[agent.tier] ?? '🤖'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-medium">{agent.agentId}</code>
                      <span className={`text-xs font-semibold ${TIER_COLORS[agent.tier]}`}>{agent.tier.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {agent.tasksCompleted} tasks · {agent.karmaTotal} karma · {agent.endorsements} endorsements
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{agent.score}</div>
                    <div className="text-xs text-gray-500">pts</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* POST SERVICE TAB */}
        {tab === 'post' && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="font-semibold mb-4">📤 Post a Service Offer</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['agentId', 'Agent ID', 'openclaw-main'],
                ['title', 'Service Title', 'Web Search — fast & relevant'],
                ['skillId', 'Skill ID', 'web_search'],
                ['priceMvx', 'Price (EGLD)', '0.001'],
              ].map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <input
                    value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs text-gray-400 block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What does your agent do exactly?"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm h-20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="search,ai,blockchain"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Max Concurrent Orders</label>
                <input
                  type="number"
                  value={form.maxConcurrent}
                  onChange={(e) => setForm((f) => ({ ...f, maxConcurrent: parseInt(e.target.value) }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              onClick={postOffer}
              disabled={loading || !form.title}
              className="mt-4 bg-green-700 hover:bg-green-600 disabled:opacity-50 px-6 py-2 rounded font-medium"
            >
              Post Service
            </button>
            {postResult && (
              <p className="mt-3 text-sm">{postResult}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
