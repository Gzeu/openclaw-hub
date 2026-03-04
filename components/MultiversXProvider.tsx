/**
 * MultiversXProvider — lightweight wrapper
 *
 * @multiversx/sdk-dapp v4 pulls in sdk-hw-provider which requires
 * sdk-core v14 sub-paths that don't exist in v13. Using DappProvider
 * at the layout level breaks Next.js SSR build.
 *
 * Authentication (WalletConnect v2 + NativeAuth) is handled entirely
 * inside app/login/page.tsx via lazy dynamic imports — no global
 * DappProvider is needed.
 *
 * This wrapper is intentionally a passthrough so layout.tsx keeps
 * its import without changes. Re-introduce DappProvider here only
 * after upgrading sdk-core to ^14 AND sdk-dapp to a compatible version.
 */
export default function MultiversXProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
