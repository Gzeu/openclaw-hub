'use client'

import { useEffect, useState } from 'react'
import { truncateAddress, formatEgld } from '@/lib/multiversx-client'

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
  const [address, setAddress] = useState('')
  const [inputAddr, setInputAddr] = useState('')
  const [account, setAccount] = useState<MvxAccount | null>(null)
  const [txs, setTxs] = useState<MvxTx[]>([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)

  const lookup = async (addr: string) => {
    if (!addr.startsWith('erd1')) return
    setLoading(true)
    try {
      const [accRes, txRes] = await Promise.all([
        fetch(`/api/wallet/balance?address=${addr}`),
        fetch(`/api/wallet/transactions?address=${addr}`),
      ])
      const accData = await accRes.json()
      const txData = await txRes.json()
      setAccount(accData.account ?? null)
      setTxs(txData.transactions ?? [])
    } catch {}
    setLoading(false)
  }

  const handleConnect = async () => {
    try {
      const { UnlockPanelManager } = await import(
        '@multiversx/sdk-dapp/out/managers/UnlockPanelManager'
      )
      const mgr = UnlockPanelManager.init({
        loginHandler: async ({ type, anchor }: any) => {
          const { ProviderFactory } = await import(
            '@multiversx/sdk-dapp/out/providers/ProviderFactory'
          )
          const provider = await ProviderFactory.create({ type, anchor })
          const { address: addr } = await provider.login()
          setAddress(addr)
          setConnected(true)
          lookup(addr)
        },
      })
      mgr.openUnlockPanel()
    } catch (e) {
      console.warn('[MVX] Connect:', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Topbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">🦾</span>
            <span className="font-bold tracking-tight">OpenClaw Hub</span>
          </a>
          <nav className="flex gap-1">
            {[['/', 'Projects'], ['/agents', 'Agents'], ['/analyst', 'AI Analyst'], ['/activity', 'Activity'], ['/wallet', 'Wallet']].map(([href, label]) => (
              <a key={href} href={href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  href === '/wallet' ? 'bg-[#23F7DD]/10 text-[#23F7DD]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔗 MultiversX Wallet</h1>
          <p className="text-zinc-400">Connect your wallet or lookup any erd1 address on {process.env.NEXT_PUBLIC_MVX_NETWORK ?? 'devnet'}.</p>
        </div>

        {/* Connect / Search */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#23F7DD]/10 hover:bg-[#23F7DD]/20 border border-[#23F7DD]/30 text-[#23F7DD] text-sm font-semibold transition-colors"
            >
              🔗 Connect xPortal / Extension
            </button>
            {connected && address && (
              <span className="self-center text-xs text-zinc-400 font-mono">
                {truncateAddress(address, 8, 6)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={inputAddr}
              onChange={(e) => setInputAddr(e.target.value)}
              placeholder="erd1... lookup any address"
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#23F7DD]/50 transition-colors"
            />
            <button
              onClick={() => lookup(inputAddr)}
              disabled={loading || !inputAddr.startsWith('erd1')}
              className="px-4 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-sm font-semibold transition-colors"
            >
              {loading ? '...' : 'Lookup'}
            </button>
          </div>
        </div>

        {/* Account card */}
        {account && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Balance', value: `${account.balanceEgld} EGLD`, icon: '💎' },
                { label: 'Nonce', value: account.nonce, icon: '#' },
                { label: 'Transactions', value: account.txCount.toLocaleString(), icon: '📤' },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4">
                  <p className="text-xs text-zinc-500">{s.icon} {s.label}</p>
                  <p className="text-xl font-bold text-white mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4 mb-8">
              <p className="text-xs text-zinc-500 mb-1">Address</p>
              <p className="font-mono text-sm text-zinc-200 break-all">{account.address}</p>
              {account.username && (
                <p className="text-xs text-[#23F7DD] mt-1">@{account.username}</p>
              )}
            </div>

            {/* Transactions */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <p className="text-sm font-semibold">Recent Transactions</p>
              </div>
              {txs.length === 0 ? (
                <p className="text-center py-8 text-zinc-500">No transactions found</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {txs.map((tx) => (
                    <a
                      key={tx.txHash}
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-zinc-400">
                            {tx.txHash.slice(0, 12)}...
                          </span>
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
                        <p className={`text-xs mt-0.5 ${STATUS_COLOR[tx.status] ?? 'text-zinc-400'}`}>
                          {tx.status}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
