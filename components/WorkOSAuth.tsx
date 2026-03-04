'use client'

/**
 * WorkOSAuth — previously rendered a duplicate <MvxConnectButton> and used
 * useGetIsLoggedIn() (requires DappProvider, always false without it).
 *
 * Auth UI is now handled exclusively by <MvxConnectButton> in Navbar.tsx
 * via the useAuth() hook which reads the real cookie session.
 *
 * Keeping this component as a null passthrough so existing imports don't break.
 */
export default function WorkOSAuth() {
  return null
}
