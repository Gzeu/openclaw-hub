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
    return config;
  },
};

export default nextConfig;
