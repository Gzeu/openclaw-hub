import { NextRequest, NextResponse } from 'next/server'
import { getSignInUrl } from '@workos-inc/authkit-nextjs'

export async function GET(request: NextRequest) {
  const redirectUri = process.env.WORKOS_REDIRECT_URI || `${new URL(request.url).origin}/auth/callback`
  const signInUrl = await getSignInUrl({ redirectUri })

  return NextResponse.redirect(signInUrl)
}
