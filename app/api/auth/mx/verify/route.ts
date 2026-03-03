import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie } from '@/lib/session';

const ACCEPTED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://openclaw-hub-ashen.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

/**
 * POST /api/auth/mx/verify
 * Body: { accessToken: "base64(address).base64(token).signature" }
 *
 * Validates a MultiversX NativeAuth accessToken, then issues a session JWT cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken } = body as { accessToken?: string };

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
    }

    // Dynamically import to avoid bundling issues on edge runtime
    const { NativeAuthServer } = await import('@multiversx/sdk-native-auth-server');

    const server = new NativeAuthServer({
      apiUrl: 'https://api.multiversx.com',
      maxExpirySeconds: 86400,
      acceptedOrigins: ACCEPTED_ORIGINS,
    });

    const userInfo = await server.validate(accessToken);
    const address: string = userInfo.address;

    if (!address || !address.startsWith('erd1')) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 401 });
    }

    const sessionToken = await createSessionToken(address);
    const response = NextResponse.json({ ok: true, address });
    setSessionCookie(response, sessionToken);

    return response;
  } catch (err: unknown) {
    console.error('[Auth/MX/Verify]', err);
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
