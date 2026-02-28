import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile @multiversx packages so Next.js handles crypto polyfilling
  transpilePackages: [
    '@multiversx/sdk-core',
    '@multiversx/sdk-wallet',
    '@multiversx/sdk-network-providers',
  ],

  webpack: (config, { isServer }) => {
    // Polyfills for browser bundle - crypto: false means use browser native crypto
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
