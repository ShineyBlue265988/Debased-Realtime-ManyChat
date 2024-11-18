import { ReactNode } from 'react';
import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import "@coinbase/onchainkit/tailwind.css";
import "@coinbase/onchainkit/styles.css";
import {
  RainbowKitProvider,
  connectorsForWallets,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';
type Props = { children: ReactNode };
import { ConnectButton } from '@rainbow-me/rainbowkit';

const queryClient = new QueryClient();

function OnchainProviders({ children }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          //   apiKey={process.env.CDP_API_KEY}
          // apiKey='KkgONfLFgUZKI8nnrttLbI78U2vyhtXg'
          chain={base}    
            
        >
        <RainbowKitProvider >
          {/* <ConnectButton /> */}
          {children}
        </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default OnchainProviders;