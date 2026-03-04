'use client';

import { DappProvider } from '@multiversx/sdk-dapp/wrappers/DappProvider';
import { SignTransactionsModals } from '@multiversx/sdk-dapp/UI/SignTransactionsModals';
import { TransactionsToastList } from '@multiversx/sdk-dapp/UI/TransactionsToastList';
import { NotificationModal } from '@multiversx/sdk-dapp/UI/NotificationModal';

const ENVIRONMENT = (process.env.NEXT_PUBLIC_MULTIVERSX_NETWORK || 'mainnet') as 'mainnet' | 'testnet' | 'devnet';
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '9b1a9564f91cb659ffe21b73d5c4e2d8';

export default function MultiversXProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DappProvider
      environment={ENVIRONMENT}
      customNetworkConfig={{
        name: 'customConfig',
        apiTimeout: 6000,
        walletConnectV2ProjectId: WALLET_CONNECT_PROJECT_ID,
      }}
    >
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals className="custom-class-for-modals" />
      {children}
    </DappProvider>
  );
}
