'use client'

import { useEffect, useState } from 'react'
import { truncateAddress } from '@/lib/multiversx-client'
import Link from 'next/link'

interface MvxAccount {
  address: string
  balanceEgld: string
  nonce: number
  txCount: number
  username?: string
}

interface MvxTx {
  txHash: string
  sender: string
  receiver: string
  valueEgld: string
  status: string
  function?: string
  timestamp: number
  explorerUrl: string
}

const STATUS_COLOR: Record<string, string> = {
  success: 'text-emerald-400',
  pending: 'text-amber-400',
  fail: 'text-red-400',
  invalid: 'text-red-400',
}

export default function WalletPage() {
  const [sessionAddress, setSessionAddress] = useState<string | null>(null)
  const [inputAddr, setInputAddr] = useState('')
  const [account, setAccount] = useState<MvxAccount | null>(null)
  const [txs, setTxs] = useState<MvxTx[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-load wallet from session cookie on mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.address) {
          setSessionAddress(data.address)
          lookup(data.address)
        }
      })
      .catch(() => {})
  }, [])

  const lookup = async (addr: string) => {
    if (!addr.startsWith('erd1')) { setError('Adresa trebuie s\u0103 înceap\u0103 cu erd1'); return }
    setLoading(true)
    setError('')
    setAccount(null)
    setTxs([])
    try {
      const [accRes, txRes] = await Promise.all([
        fetch(`/api/wallet/balance?address=${addr}`),
        fetch(`/api/wallet/transactions?address=${addr}`),
      ])
      const accData = await accRes.json()
      const txData = await txRes.json()
      if (!accRes.ok) throw new Error(accData.error ?? 'Eroare laâncărcare cont')
      setAccount(accData.account ?? null)
      setTxs(txData.transactions ?? [])
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">&#x1F4CE; MultiversX Wallet</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {sessionAddress
              ? 'Portofel conectat · Mainnet'
              : 'Caută orice adresă erd1 pe Mainnet'}
          </p>
        </div>
        {sessionAddress && (
          <Link href="/profile" className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors">
            &#x1F464; Profil
          </Link>
        )}
      </div>

      {/* Session address badge */}
      {sessionAddress && (
        <div className="flex items-center gap-3 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl px-5 py-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span className="font-mono text-sm text-cyan-400 break-all">{sessionAddress}</span>
          <a
            href={`https://explorer.multiversx.com/accounts/${sessionAddress}`}
            target="_blank" rel="noopener noreferrer"
            className="ml-auto text-xs text-zinc-400 hover:text-white whitespace-nowrap transition-colors"
          >
            Explorer ↗
          </a>
        </div>
      )}

      {/* Manual lookup */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Lookup manual</p>
        <div className="flex gap-2">
          <input
            value={inputAddr}
            onChange={e => setInputAddr(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup(inputAddr)}
            placeholder="erd1..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={() => lookup(inputAddr)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-sm font-semibold transition-colors"
          >
            {loading ? '...' : 'Caută'}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <div key={i} className="h-24 bg-zinc-900/50 border border-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Account card */}
      {account && !loading && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Balance', value: `${account.balanceEgld} EGLD`, icon: '&#x1F4B0;' },
              { label: 'Nonce', value: account.nonce, icon: '#' },
              { label: 'Tranzacții', value: account.txCount.toLocaleString('ro-RO'), icon: '&#x1F4E4;' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4">
                <p className="text-xs text-zinc-500 mb-1" dangerouslySetInnerHTML={{__html: s.icon + ' ' + s.label}} />
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {account.username && (
            <div className="px-4 py-2 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-sm text-cyan-400">
              @{account.username}
            </div>
          )}

          {/* Transactions */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Tranzacții recente</p>
              <span className="text-xs text-zinc-500">{txs.length} găsite</span>
            </div>
            {txs.length === 0 ? (
              <p className="text-center py-10 text-zinc-500 text-sm">Nicio tranzacție găsită</p>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {txs.map(tx => (
                  <a
                    key={tx.txHash}
                    href={tx.explorerUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">{tx.txHash.slice(0, 12)}...</span>
                        {tx.function && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded border border-violet-500/30">
                            {tx.function}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {truncateAddress(tx.sender)} → {truncateAddress(tx.receiver)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-white">{tx.valueEgld} EGLD</p>
                      <p className={`text-xs mt-0.5 ${STATUS_COLOR[tx.status] ?? 'text-zinc-400'}`}>{tx.status}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* No session & no lookup */}
      {!sessionAddress && !account && !loading && (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-4xl mb-4">🔗</p>
          <p className="text-zinc-400 text-sm">Conectează-te cu xPortal sau introduce manual o adresă erd1.</p>
          <Link href="/login" className="inline-block mt-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors">
            Conectează-te
          </Link>
        </div>
      )}
    </div>
  )
}
