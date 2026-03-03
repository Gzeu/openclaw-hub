'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type LoginStep = 'idle' | 'connecting' | 'waiting_scan' | 'verifying' | 'done' | 'error';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/';

  const [step, setStep] = useState<LoginStep>('idle');
  const [qrUri, setQrUri] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const handleConnect = useCallback(async () => {
    setStep('connecting');
    setError('');

    try {
      const { WalletConnectV2Provider } = await import(
        '@multiversx/sdk-wallet-connect-provider'
      );
      const { NativeAuthClient } = await import('@multiversx/sdk-native-auth-client');

      const CHAIN_ID = '1'; // mainnet
      const RELAY_URL = 'wss://relay.walletconnect.com';

      // Support multiple env var naming conventions
      const PROJECT_ID =
        process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
        process.env.NEXT_PUBLIC_WC_PROJECT_ID;

      if (!PROJECT_ID) {
        throw new Error(
          'WalletConnect Project ID missing. Set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in Vercel env vars.'
        );
      }

      const APP_URL =
        process.env.NEXT_PUBLIC_APP_URL ??
        'https://openclaw-hub-ashen.vercel.app';

      // Build NativeAuth init token (fetches latest block hash from mainnet)
      const nativeAuthClient = new NativeAuthClient({
        origin: APP_URL,
        expirySeconds: 86400,
      });
      const nativeAuthInitToken = await nativeAuthClient.initialize();

      const provider = new WalletConnectV2Provider(
        {
          onClientLogin: () => {},
          onClientLogout: () => setStep('idle'),
          onClientEvent: () => {},
        },
        CHAIN_ID,
        RELAY_URL,
        PROJECT_ID
      );

      await provider.init();

      const { uri, approval } = await provider.connect({
        methods: ['mvx_signNativeAuthToken', 'mvx_cancelAction'],
      });

      if (uri) {
        setQrUri(uri);
        setStep('waiting_scan');
      }

      // Wait for xPortal scan & signature
      const loginResult = await provider.login({
        approval,
        token: nativeAuthInitToken,
      });

      const walletAddress = loginResult.address ?? (await provider.getAddress());
      const signature =
        (loginResult as any).signature ??
        ((provider as any).getSignature
          ? await (provider as any).getSignature()
          : '');

      setStep('verifying');

      // Build accessToken using SDK helper (correct format for NativeAuth server)
      const accessToken = nativeAuthClient.getToken(
        walletAddress,
        nativeAuthInitToken,
        signature
      );

      const res = await fetch('/api/auth/mx/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Verification failed');
      }

      setAddress(walletAddress);
      setStep('done');
      setTimeout(() => router.push(from), 800);
    } catch (err: unknown) {
      console.error('[Login]', err);
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setError(msg);
      setStep('error');
    }
  }, [from, router]);

  // Auto-open QR as deeplink on mobile
  useEffect(() => {
    if (qrUri && /android|iphone|ipad/i.test(navigator.userAgent)) {
      window.location.href = qrUri;
    }
  }, [qrUri]);

  const qrImageUrl = qrUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrUri)}&bgcolor=0a0a0a&color=22d3ee&format=svg`
    : '';

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🧠</div>
          <h1 className="text-2xl font-bold text-white">OpenClaw Hub</h1>
          <p className="text-zinc-400 text-sm">AI Agent Ecosystem</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          {/* Idle */}
          {step === 'idle' && (
            <>
              <div className="text-center space-y-1">
                <p className="text-zinc-300 text-sm">Conectează-te cu portofelul tău MultiversX</p>
                <p className="text-zinc-500 text-xs">Mainnet · xPortal</p>
              </div>
              <button
                onClick={handleConnect}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>🔷</span> Connect xPortal
              </button>
            </>
          )}

          {/* Connecting */}
          {step === 'connecting' && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">⌛</div>
              <p className="text-zinc-300 text-sm">Se inițializează...</p>
            </div>
          )}

          {/* QR */}
          {step === 'waiting_scan' && qrUri && (
            <>
              <p className="text-center text-zinc-300 text-sm">
                Scanează cu <strong>xPortal</strong> pe telefon
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImageUrl} alt="xPortal QR" className="mx-auto rounded-xl" />
              <p className="text-center text-zinc-500 text-xs">Aşteaptă confirmare din aplicație...</p>
              <button
                disabled
                className="w-full bg-zinc-800 text-zinc-400 py-2 px-4 rounded-xl text-sm cursor-wait"
              >
                ⏳ Waiting for xPortal...
              </button>
            </>
          )}

          {/* Verifying */}
          {step === 'verifying' && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">🔄</div>
              <p className="text-zinc-300 text-sm">Se verifică semnatura...</p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">✅</div>
              <p className="text-zinc-300 text-sm">Conectat!</p>
              <p className="text-cyan-400 font-mono text-xs">
                {address.slice(0, 8)}...{address.slice(-6)}
              </p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <>
              <div className="text-center space-y-3 py-4">
                <div className="text-4xl">⚠️</div>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={() => { setStep('idle'); setError(''); setQrUri(''); }}
                className="w-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 py-2 px-4 rounded-xl transition-all text-sm"
              >
                Încearcă din nou
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs">
          MultiversX Mainnet · WalletConnect v2 · Native Auth
        </p>
      </div>
    </div>
  );
}
