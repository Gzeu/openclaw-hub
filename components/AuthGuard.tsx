'use client'
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useGetIsLoggedIn()
  const router = useRouter()

  useEffect(() => {
    // În loc de redirecționare forțată la /auth,
    // putem lăsa utilizatorul pe pagină dar cu UI-ul blocat (vezi agents/page.tsx)
    // sau redirecționăm la /wallet
    if (!isLoggedIn) {
      router.push('/wallet')
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  return <>{children}</>
}
