import { NextRequest, NextResponse } from 'next/server'
import { authkit } from '@workos-inc/authkit-nextjs'

export const GET = authkit.handler((request: NextRequest) => {
  // Handle the callback from WorkOS
  // This will automatically handle the OAuth flow and set cookies
  return NextResponse.redirect(new URL('/agents', request.url))
})
