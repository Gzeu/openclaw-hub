import { NextRequest, NextResponse } from 'next/server'
import { getSignUpUrl } from '@workos-inc/authkit-nextjs'

export async function GET(request: NextRequest) {
  const signUpUrl = await getSignUpUrl()
  
  return NextResponse.redirect(signUpUrl)
}
