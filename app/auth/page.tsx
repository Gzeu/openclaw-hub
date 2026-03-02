'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthForms from '@/components/AuthForms'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth-token')
    if (token) {
      // Verify token validity (optional - could decode JWT)
      router.push('/agents')
    }
  }, [router])

  const handleAuthSuccess = (userData: any, token: string) => {
    setUser(userData)
    localStorage.setItem('auth-token', token)
    router.push('/agents')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AuthForms
        mode={mode}
        onToggleMode={() => setMode(mode === 'login' ? 'register' : 'login')}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
