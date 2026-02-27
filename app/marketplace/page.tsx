'use client'

import { useState, useEffect } from 'react'

interface MarketplaceItem {
  id: string
  name: string
  description: string
  category: string
  price: number
  currency: string
  seller: string
  rating: number
  sales: number
  tags: string[]
}

const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: '1', name: 'Web Search Skill', description: 'AI-optimized web search using Tavily + Brave. Returns structured results.', category: 'Search',
    price: 0, currency: 'free', seller: 'openclaw-main', rating: 4.9, sales: 312, tags: ['search', 'tavily', 'brave'],
  },
  {
    id: '2', name: 'Code Analysis Pack', description: 'Deep code review, bug detection, and refactoring suggestions via OpenRouter.', category: 'Code',
    price: 0.001, currency: 'EGLD', seller: 'openclaw-main', rating: 4.7, sales: 87, tags: ['code', 'analysis', 'ai'],
  },
  {
    id: '3', name: 'MultiversX Query Agent', description: 'Query MVX blockchain: accounts, transactions, tokens, smart contracts.', category: 'Blockchain',
    price: 0, currency: 'free', seller: 'openclaw-mvx', rating: 4.8, sales: 145, tags: ['mvx', 'blockchain', 'devnet'],
  },
  {
    id: '4', name: 'Data Research Bundle', description: 'Wikipedia, Wikidata, news aggregation — structured data for any topic.', category: 'Data',
    price: 0, currency: 'free', seller: 'openclaw-main', rating: 4.6, sales: 203, tags: ['data', 'wikipedia', 'news'],
  },
  {
    id: '5', name: 'E2B Code Executor', description: 'Secure Python & JS sandboxed execution with stdout/stderr capture.', category: 'Code',
    price: 0.0005, currency: 'EGLD', seller: 'openclaw-sandbox', rating: 4.9, sales: 56, tags: ['e2b', 'sandbox', 'python'],
  },
  {
    id: '6', name: 'Crypto Price Tracker', description: 'Real-time prices from CoinGecko + CoinCap. Supports 10,000+ assets.', category: 'Finance',
    price: 0, currency: 'free', seller: 'openclaw-finance', rating: 4.5, sales: 421, tags: ['crypto', 'prices', 'coingecko'],
  },
]

const CATEGORIES = ['All', 'Search', 'Code', 'Blockchain', 'Data', 'Finance']

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>(MOCK_ITEMS)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'sales' | 'price'>('rating')

  const filtered = items
    .filter(i => activeCategory === 'All' || i.category === activeCategory)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.tags.some(t => t.includes(search.toLowerCase())))
    .sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🛒</span>
            <h1 className="text-3xl font-black text-white">Marketplace</h1>
            <span className="badge badge-accent">Beta</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Discover and deploy agent skills, tools, and data connectors.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <input
            className="input max-w-xs"
            placeholder="🔍 Search skills, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'btn-primary'
                    : 'btn-ghost'
                }`}
                style={activeCategory === cat ? { background: 'var(--accent)', color: '#fff' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sort:</span>
            {(['rating', 'sales', 'price'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="text-xs px-2 py-1 rounded-lg transition-colors"
                style={{
                  background: sortBy === s ? 'var(--accent-soft)' : 'transparent',
                  color: sortBy === s ? '#a78bfa' : 'var(--text-muted)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="card card-glow p-5 flex flex-col gap-3 animate-fade-up"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                </div>
                <span className="badge badge-accent shrink-0">{item.category}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {item.tags.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{t}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>⭐ {item.rating}</span>
                  <span>{item.sales} uses</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: item.price === 0 ? 'var(--green)' : 'var(--amber)' }}
                  >
                    {item.price === 0 ? 'FREE' : `${item.price} ${item.currency}`}
                  </span>
                  <button className="btn btn-primary py-1 px-3 text-xs">
                    Deploy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="text-5xl">🔍</span>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>No skills match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
