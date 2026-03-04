'use client'
import { useState, useEffect } from 'react'

export interface AuthUser {
  address: string
}

export interface AuthState {
  isLoggedIn: boolean
  user: AuthUser | null
  loading: boolean
}

/**
 * useAuth — checks cookie-based session via /api/auth/me.
 * Works WITHOUT DappProvider. Compatible with xPortal NativeAuth login flow.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true,
  })

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.address) {
          setState({ isLoggedIn: true, user: data, loading: false })
        } else {
          setState({ isLoggedIn: false, user: null, loading: false })
        }
      })
      .catch(() => setState({ isLoggedIn: false, user: null, loading: false }))
  }, [])

  return state
}
