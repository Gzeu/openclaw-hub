"use client";

import { EnvironmentsEnum } from "@multiversx/sdk-dapp/types";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider";
import { ReactNode } from "react";

// Definim pe ce rețea lucrăm (Devnet pentru testare)
const environment = EnvironmentsEnum.devnet;

export default function MultiversXProvider({ children }: { children: ReactNode }) {
  return (
    <DappProvider
      environment={environment}
      customNetworkConfig={{
        name: "customConfig",
        apiTimeout: 6000,
        walletConnectV2ProjectId: "YOUR_WALLET_CONNECT_ID_HERE", // Poți adăuga un ID real de la WalletConnect ulterior
      }}
    >
      {children}
    </DappProvider>
  );
}
