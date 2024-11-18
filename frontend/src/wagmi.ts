import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
// import { coinbaseWallet } from 'wagmi/connectors';
import { 
  RainbowKitProvider, 
  connectorsForWallets, 
  getDefaultConfig, 
} from '@rainbow-me/rainbowkit'; 
import { 
  metaMaskWallet, 
  rainbowWallet, 
  coinbaseWallet, 
  walletConnectWallet
} from '@rainbow-me/rainbowkit/wallets'; 
const connectors = connectorsForWallets( 
  [
    {
      groupName: 'Recommended Wallet',
      wallets: [  metaMaskWallet ],
    },
    {
      groupName: 'Other Wallets',
      wallets: [coinbaseWallet,walletConnectWallet],
    },
  ],
  {
    appName: 'onchainkit',
    projectId: "610f266baca20dbe394f808f8b1e19de",
  }
); 
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  multiInjectedProviderDiscovery: false,
  connectors,
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});