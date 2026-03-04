'use client'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * MvxConnectButton — NO sdk-dapp hooks, NO DappProvider needed.
 * When not logged in → redirects to /login?from=<current page> (xPortal QR flow).
 * When logged in    → shows truncated address + Disconnect button.
 * Uses window.location.href for login/logout to force full page reload
 * so that useAuth re-reads the session cookie in the Navbar.
 */
export default function MvxConnectButton() {
  const { isLoggedIn, user, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="px-4 py-1.5 rounded-lg bg-zinc-800 text-zinc-600 text-xs w-32 animate-pulse">
        &nbsp;
      </div>
    )
  }

  if (isLoggedIn && user) {
    const short = `${user.address.slice(0, 6)}\u2026${user.address.slice(-4)}`
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 font-mono hidden md:block">{short}</span>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            localStorage.removeItem('auth-token')
            // Full reload so Navbar re-reads (cleared) session cookie
            window.location.href = '/login'
          }}
          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs hover:bg-red-500/20 transition-all"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        window.location.href = `/login?from=${encodeURIComponent(pathname)}`
      }}
      className="px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-all flex items-center gap-2"
    >
      <span>⚡</span> xPortal
    </button>
  )
}
