'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wallet, LogOut, ArrowRightLeft, Cpu, ShieldCheck, Zap } from 'lucide-react'

interface MxSession {
  address: string
  balance?: string
}

export default function EconomyPage() {
  const [session, setSession] = useState<MxSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [amountToDeposit, setAmountToDeposit] = useState('1.5')

  useEffect(() => {
    fetch('/api/auth/mx/session')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setSession(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const isLoggedIn = !!session?.address
  const address = session?.address ?? ''
  const balance = session?.balance ?? '0'

  const formatBalance = (bal: string) => {
    if (!bal || bal === '0') return '0.0000'
    return (parseFloat(bal) / 1e18).toFixed(4)
  }

  const handleDisconnect = async () => {
    await fetch('/api/auth/mx/logout', { method: 'POST' })
    setSession(null)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="text-gray-400">Loading wallet status...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Wallet className="text-[#23F7DD]" size={32} />
          Agent Economy & Decentralized Payments
        </h1>
        <p className="text-gray-400">
          Connect your MultiversX wallet to fund agents, pay for AI models, and participate in the on-chain agent marketplace.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#23F7DD]" />
              Wallet Status
            </h2>
            {!isLoggedIn ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-4">Connect via MultiversX to unlock economic features.</p>
                <Link
                  href="/login?from=/economy"
                  className="block w-full text-center bg-[#23F7DD] text-black font-semibold py-3 rounded-lg hover:bg-[#23F7DD]/90 transition-colors"
                >
                  Connect xPortal Wallet
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                  <div className="text-xs text-gray-500 mb-1">Connected Address</div>
                  <div className="font-mono text-xs break-all text-[#23F7DD]">{address}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-lg border border-[#333]">
                  <div className="text-xs text-gray-500 mb-1">Wallet Balance</div>
                  <div className="text-3xl font-bold">
                    {formatBalance(balance)}
                    <span className="text-sm font-normal text-gray-400 ml-1">EGLD</span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 rounded-lg transition-colors"
                >
                  <LogOut size={18} /> Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Funding panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`bg-[#111] border border-[#1e1e1e] rounded-xl p-6 relative overflow-hidden ${!isLoggedIn ? 'opacity-50 pointer-events-none' : ''}`}>
            {!isLoggedIn && (
              <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-[#1a1a1a] border border-[#333] px-6 py-3 rounded-lg text-sm">Connect wallet to manage agent funds</div>
              </div>
            )}
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Zap size={20} className="text-[#23F7DD]" /> Fund Agent Workspace
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Deposit EGLD into your agent smart contract escrow.
                  Agents use this balance to pay for API calls and delegated tasks.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Deposit Amount (EGLD)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amountToDeposit}
                        onChange={e => setAmountToDeposit(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-4 pr-16 py-3 text-white focus:outline-none focus:border-[#23F7DD] transition-colors"
                        min="0.1" step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">EGLD</span>
                    </div>
                  </div>
                  <button className="w-full bg-[#23F7DD] text-black font-semibold py-3 rounded-lg hover:bg-[#23F7DD]/90 transition-colors flex items-center justify-center gap-2">
                    <ArrowRightLeft size={18} /> Confirm Deposit
                  </button>
                  <p className="text-xs text-center text-gray-600">Smart Contract TX requested via connected wallet.</p>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-5 border border-[#333] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    <Cpu size={16} /> Active Escrow Balance
                  </h3>
                  <div className="text-4xl font-bold mb-2">0.0000 <span className="text-lg text-gray-500 font-normal">EGLD</span></div>
                  <p className="text-xs text-gray-500">Estimated runway: ~0 API calls</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#333]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">Today&apos;s Usage</span><span>0.00 EGLD</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Active Delegations</span><span>0 tasks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#23F7DD]/10 to-transparent border border-[#23F7DD]/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">How the OpenClaw Economy Works</h3>
            <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4">
              <li>Funds locked in a secure MultiversX smart contract escrow.</li>
              <li>Agents request micropayments only when executing specific skills or API calls.</li>
              <li>Withdraw unspent funds back to your wallet at any time.</li>
              <li>Future: ESDT tokens (USDC) and custom agent tokens support.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
