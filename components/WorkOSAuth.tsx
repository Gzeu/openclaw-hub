'use client'

import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks'
import MvxConnectButton from '@/components/MvxConnectButton'

export default function WorkOSAuth() {
  const isLoggedIn = useGetIsLoggedIn()
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-500">
        {isLoggedIn ? 'Wallet connected' : 'Wallet required'}
      </span>
      <MvxConnectButton />
    </div>
  )
}
