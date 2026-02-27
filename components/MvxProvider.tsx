'use client'
// MultiversX DApp Provider — wraps the app with sdk-dapp context
// Must wrap the entire app tree (add to layout.tsx)
import { useEffect } from 'react'

interface MvxProviderProps {
  children: React.ReactNode
  network?: 'mainnet' | 'testnet' | 'devnet'
}

export function MvxProvider({ children, network = 'devnet' }: MvxProviderProps) {
  useEffect(() => {
    // Dynamically import sdk-dapp to avoid SSR issues
    // sdk-dapp requires browser environment
    const initMvx = async () => {
      try {
        const { initApp } = await import(
          '@multiversx/sdk-dapp/out/methods/initApp/initApp'
        )
        await initApp({
          storage: { getStorageCallback: () => sessionStorage },
          dAppConfig: {
            environment: network as any,
            nativeAuth: true,
          },
        })
        console.log('[MVX] sdk-dapp initialized on', network)
      } catch (e) {
        // sdk-dapp not installed yet — graceful fallback
        console.warn('[MVX] sdk-dapp not available:', e)
      }
    }
    initMvx()
  }, [network])

  return <>{children}</>
}
