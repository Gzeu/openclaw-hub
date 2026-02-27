'use client'
// MultiversX Connect Button — opens UnlockPanelManager
// Uses sdk-dapp's built-in wallet connect panel
import { useState } from 'react'

interface Props {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
  className?: string
}

export function MvxConnectButton({ onConnect, onDisconnect, className }: Props) {
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
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
          onConnect?.(addr)
        },
      })
      mgr.openUnlockPanel()
    } catch (e) {
      console.warn('[MVX] Connect error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const { getAccountProvider } = await import(
        '@multiversx/sdk-dapp/out/providers/helpers/accountProvider'
      )
      const provider = getAccountProvider()
      await provider.logout()
      setAddress(null)
      onDisconnect?.()
    } catch (e) {
      console.warn('[MVX] Disconnect error:', e)
    }
  }

  if (address) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        <span className="text-xs text-zinc-400 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={handleDisconnect}
          className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg border border-red-900/40 hover:border-red-700/60"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#23F7DD]/10 hover:bg-[#23F7DD]/20 border border-[#23F7DD]/30 text-[#23F7DD] text-xs font-semibold transition-colors disabled:opacity-50 ${className ?? ''}`}
    >
      <span>🔗</span>
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
