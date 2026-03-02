'use client'

import { AuthKitProvider } from '@workos-inc/authkit-react'

export default function WorkOSAuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || process.env.WORKOS_CLIENT_ID
  
  if (!clientId) {
    console.error('WORKOS_CLIENT_ID is not set in environment variables')
    return <div>Authentication configuration error</div>
  }

  return (
    <AuthKitProvider clientId={clientId}>
      {children}
    </AuthKitProvider>
  )
}
