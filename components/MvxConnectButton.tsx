'use client'
import { useState } from 'react'
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks'
import { logout } from '@multiversx/sdk-dapp/utils'
import { ExtensionLoginButton, WebWalletLoginButton } from '@multiversx/sdk-dapp/UI'

export default function MvxConnectButton() {
  const isLoggedIn = useGetIsLoggedIn()
  const [showMethods, setShowMethods] = useState(false)

  const handleLogout = () => {
    logout(`${window.location.origin}/wallet`)
    localStorage.removeItem('auth-token') // Curățăm și vechiul token dacă există
  }

  if (isLoggedIn) {
    return (
      <button
        onClick={handleLogout}
        className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm hover:bg-red-500/20 transition-all"
      >
        Disconnect Wallet
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMethods(!showMethods)}
        className="px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-all flex items-center gap-2"
      >
        <span>⚡</span> Connect MultiversX
      </button>

      {showMethods && (
        <div className="absolute right-0 mt-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 min-w-[200px] flex flex-col gap-1">
          <ExtensionLoginButton
            callbackRoute="/agents"
            loginButtonText="DeFi Wallet"
            className="!bg-zinc-800 !border-zinc-700 !text-sm !py-2 !rounded-lg hover:!bg-zinc-700"
          />
          <WebWalletLoginButton
            callbackRoute="/agents"
            loginButtonText="Web Wallet"
            className="!bg-zinc-800 !border-zinc-700 !text-sm !py-2 !rounded-lg hover:!bg-zinc-700"
          />
        </div>
      )}
    </div>
  )
}
