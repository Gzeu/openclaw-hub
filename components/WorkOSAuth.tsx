'use client'

import { useUser } from '@workos-inc/authkit-react'

export default function WorkOSAuth() {
  const { user, signIn, signOut, isLoading } = useUser()

  const handleSignIn = () => {
    signIn({
      provider: 'google', // or any other provider you want to use
    })
  }

  const handleSignOut = () => {
    signOut()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-zinc-700 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-zinc-700 rounded animate-pulse"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-white">{user.firstName || user.email}</span>
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
    >
      Sign In with WorkOS
    </button>
  )
}
