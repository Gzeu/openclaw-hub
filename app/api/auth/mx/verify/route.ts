import { NextRequest, NextResponse } from 'next/server';
import { encodeSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session';

const ACCEPTED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? 'https://openclaw-hub-ashen.vercel.app';
const MVX_API = 'https://api.multiversx.com';

/**
 * Validates a MultiversX Native Auth accessToken.
 * Format: base64url(address).base64url(token).signature
 * We call the MultiversX API to verify the signature on-chain.
 */
async function validateNativeAuth(
  accessToken: string
): Promise<{ address: string; origin: string } | null> {
  try {
    const { NativeAuthServer } = await import('@multiversx/sdk-native-auth-server');
    const server = new NativeAuthServer({
      apiUrl: MVX_API,
      acceptedOrigins: [ACCEPTED_ORIGIN],
      maxExpirySeconds: 86400,
    });
    const result = await server.validate(accessToken);
    return result;
  } catch (err) {
    console.error('[mx/verify] NativeAuth validation failed:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken } = body as { accessToken: string };

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
    }

    const result = await validateNativeAuth(accessToken);
    if (!result?.address) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const session = {
      walletAddress: result.address,
      connectedAt: Date.now(),
      expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
    };
    const sessionToken = encodeSession(session);

    const response = NextResponse.json({
      success: true,
      address: result.address,
    });

    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[mx/verify] Unexpected error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
