import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Ignore TypeScript and ESLint errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Transpile @multiversx packages so Next.js handles crypto polyfilling
  transpilePackages: [
    '@multiversx/sdk-core',
    '@multiversx/sdk-wallet',
    '@multiversx/sdk-network-providers',
    '@multiversx/sdk-hw-provider',
    '@multiversx/sdk-webview-provider',
  ],
  webpack: (config, { isServer }) => {
    // sdk-hw-provider and sdk-webview-provider (peers of sdk-dapp@4) import deep
    // subpaths like @multiversx/sdk-core/out/core/address that don't exist in
    // sdk-core@13.x — redirect them to the sdk-core main entry (barrel exports).
    const sdkCoreEntry = path.resolve(__dirname, 'node_modules/@multiversx/sdk-core');
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      '@multiversx/sdk-core/out/core/address':             sdkCoreEntry,
      '@multiversx/sdk-core/out/core/message':             sdkCoreEntry,
      '@multiversx/sdk-core/out/core/transaction':         sdkCoreEntry,
      '@multiversx/sdk-core/out/core/transactionComputer': sdkCoreEntry,
    };

    // Polyfills for browser bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        path:   false,
        fs:     false,
        net:    false,
        tls:    false,
      };
    }

    // @multiversx/sdk-dapp is browser-only — mark as external for server builds
    if (isServer) {
      const existing = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [
        ...existing,
        '@multiversx/sdk-dapp/out/providers/ProviderFactory',
        '@multiversx/sdk-dapp/out/managers/UnlockPanelManager',
        '@multiversx/sdk-dapp',
      ];
    }

    return config;
  },
};

export default nextConfig;
