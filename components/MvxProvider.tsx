'use client'
import { useEffect } from 'react'

interface MvxProviderProps {
  children: React.ReactNode
  network?: 'mainnet' | 'testnet' | 'devnet'
}

export function MvxProvider({ children, network = 'devnet' }: MvxProviderProps) {
  useEffect(() => {
    // MultiversX SDK initialization would go here
    // sdk-dapp requires specific module paths not available in this build
    console.log('[MVX] Provider initialized for network:', network)
  }, [network])

  return <>{children}</>
}
