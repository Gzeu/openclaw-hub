'use client'

import { AuthKitProvider } from '@workos-inc/authkit-react'

export default function WorkOSAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider clientId={process.env.WORKOS_CLIENT_ID!}>
      {children}
    </AuthKitProvider>
  )
}
