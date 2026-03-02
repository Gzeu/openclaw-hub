import { NextRequest, NextResponse } from 'next/server'
import { handleAuth } from '@workos-inc/authkit-nextjs'

export const GET = handleAuth({
  returnPathname: '/agents',
  onSuccess: async ({ user }) => {
    console.log('User successfully authenticated:', user.email)
    return NextResponse.redirect(new URL('/agents', process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || 'http://localhost:3000'))
  },
  onError: async (error) => {
    console.error('Authentication error:', error)
    return NextResponse.json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
})
