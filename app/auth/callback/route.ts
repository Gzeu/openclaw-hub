import { NextRequest, NextResponse } from 'next/server'
import { handleAuth } from '@workos-inc/authkit-nextjs'

export const GET = handleAuth({
  returnPathname: '/agents',
  onSuccess: async ({ user }) => {
    console.log('User successfully authenticated:', user.email)
    // AuthKit will handle the redirect automatically
  },
  onError: async (error: any) => {
    console.error('Authentication error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    // Check if it's a redirect URI error
    if (error?.message && error.message.includes('redirect URI')) {
      return NextResponse.json({
        error: 'Redirect URI configuration error',
        message: 'Please add http://localhost:3000/auth/callback to WorkOS dashboard Redirect URIs',
        details: 'Check WorkOS dashboard → Configuration → Redirect URIs',
        fix: 'Add both http://localhost:3000 and http://localhost:3000/auth/callback to your WorkOS Redirect URIs',
        current_redirect_uri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI
      }, { status: 400 })
    }
    
    return NextResponse.json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : 'No error details available'
    }, { status: 500 })
  }
})
