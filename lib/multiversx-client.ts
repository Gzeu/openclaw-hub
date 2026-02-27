'use client'
// Client-side MVX helpers — uses @multiversx/sdk-dapp
// These run ONLY in the browser (wallet connect, tx signing)

// initApp config — call this in your layout or _app
export function getMvxConfig() {
  const network = process.env.NEXT_PUBLIC_MVX_NETWORK ?? 'devnet'
  const envMap: Record<string, string> = {
    mainnet: 'mainnet',
    testnet: 'testnet',
    devnet: 'devnet',
  }
  return {
    environment: envMap[network] ?? 'devnet',
    nativeAuth: true,
  }
}

// Format raw EGLD denomination to human readable
export function formatEgld(raw: string | bigint, decimals = 4): string {
  const n = typeof raw === 'bigint' ? raw : BigInt(raw || '0')
  return (Number(n) / 1e18).toFixed(decimals)
}

// Truncate erd1 address for display
export function truncateAddress(addr: string, start = 6, end = 4): string {
  if (!addr || addr.length < start + end + 3) return addr
  return `${addr.slice(0, start)}...${addr.slice(-end)}`
}
