import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Treat @multiversx packages as server-side externals
  // so Node.js built-in 'crypto' is resolved natively
  serverExternalPackages: ['@multiversx/sdk-core', '@multiversx/sdk-wallet'],

  webpack: (config, { isServer }) => {
    // Polyfills for browser bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        path: false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    if (isServer) {
      // @multiversx/sdk-dapp is browser-only, mark as external for server builds
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
