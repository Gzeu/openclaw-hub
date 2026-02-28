import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
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

    if (!isServer) {
      // Polyfills for Node.js built-ins used by @multiversx/sdk-core in browser
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

    return config;
  },
};

export default nextConfig;
