import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ChatBox from './pages/ChatBox';
import Login from './pages/Login';
import WelcomeModal from './pages/WelcomeModal';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store'; // Ensure you import your store
import SubscriptionPages from './pages/SubscriptionPages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicContextProvider, useDynamicContext, useRpcProviders } from '@dynamic-labs/sdk-react-core';
import { evmProvidersSelector } from '@dynamic-labs/ethereum-core'
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { base, baseSepolia } from 'viem/chains';
import Header from './components/ui/Header';
import Profile from './pages/Profile';
import { getWeb3Provider, getSigner } from '@dynamic-labs/ethers-v6';
import { getName } from '@coinbase/onchainkit/identity';


const walletAddress = "";
const ProtectedRoute = ({ address, children }) => {
  let username = useSelector(state => state.auth.username);
  const isSubscribed = useSelector(state => state.auth.isSubscribed); // Fixed: Added the correct state property
  const loading = useSelector(state => state.auth.loading);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // let username = useSelector(state => state.auth.username);
  // console.log("Username:", username);
  if (!username) {
    return <Navigate to="/" />;
  }

  if (!isSubscribed) {
    return <Navigate to="/subscription" />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const queryClient = new QueryClient();
  const username = useSelector(state => state.auth.username);
  // console.log("Username:", username);
  const walletAddress = useSelector(state => state.auth.walletAddress);
  const dynamicSettings = {
    environmentId: "ce7eb472-8f4f-43d0-9eab-edc98094c129",
    // environmentId: "83ff71ab-4c2e-4b74-b464-681e067c59ac",
    walletConnectors: [EthereumWalletConnectors,],
    enableEnsLookup: true,
    evmNetworks: [
      {
        chainId: base.id,
        chainName: 'Base',
        networkId: base.id,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: [base.rpcUrls.default.http[0]],
        blockExplorerUrls: [base.blockExplorers.default.url],
      },
      {
        chainId: baseSepolia.id,
        chainName: 'Base Sepolia',
        networkId: baseSepolia.id,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: [baseSepolia.rpcUrls.default.http[0]],
        blockExplorerUrls: [baseSepolia.blockExplorers.default.url],
      },
    ],
    autoConnect: false,
    defaultNetwork: base.id,
    cssOverride: {
      colors: {
        primary: '#3B82F6',
        secondary: '#1D4ED8',
      },
    },
  };
  // useEffect(() => {
  //   if (primaryWallet) {
  //     setUsername(primaryWallet.walletAddress.slice(0, 7));
  //     console.log("Username:", username);
  //     setWalletAddress(primaryWallet.walletAddress)
  //     console.log("Wallet Address",walletAddress)
  //   }
  // }, [primaryWallet]);
  // const handleLogin = (user) => {
  //   // console.log("App component received user:", user);
  //   const primaryWallet = user.primaryWallet; // Access primaryWallet from the user object
  //   // console.log("Primary wallet:", primaryWallet);
  //   const address = primaryWallet?.address; // Safely access address
  //   setWalletAddress(address);
  //   setUsername(address?.slice(0, 7)); // Set username based on wallet address
  //   // console.log("Username:", username);
  // };
  // console.log("Username:", username);
  console.log("Wallet Address:", walletAddress);
  return (
    <Router>
      {/* <Provider store={store}> */}
      <DynamicContextProvider settings={dynamicSettings}>
        <div className="max-h-100vh overflow-y-hidden">
          <Header />
          {/* <QueryClientProvider client={queryClient}> */}
          <div className=" bg-gradient-to-br from-gray-50 to-indigo-100 flex items-center justify-center overflow-y-auto">
            <Routes>
              <Route
                path="/"
                element={<Login />}
              />
              <Route path="/subscription" element={<SubscriptionPages address={walletAddress} />} />
              <Route path="/Profile" className="max-w-2xl bg-white" element={<Profile username={username} walletAddress={walletAddress} />} />
              <Route
                path="/chat"
                element={
                  <div style={{
                    backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pattern-01-qX0NjZaOV8g9QrnkzzOeFWx1ByjbJH.png')`,
                    backgroundRepeat: 'repeat',
                    height: '92vh',
                    width: '100vw',
                  }}>
                    {
                      <ProtectedRoute address={walletAddress}>
                        <ChatBox username={username} walletAddress={walletAddress} />
                      </ProtectedRoute>
                    }
                  </div>
                }
              />
            </Routes>
          </div>
          {/* </QueryClientProvider> */}
        </div>
      </DynamicContextProvider>
      {/* </Provider> */}

    </Router>
  );
}

export default App;

