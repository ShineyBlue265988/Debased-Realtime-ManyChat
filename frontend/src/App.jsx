import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ChatBox from './pages/ChatBox';
import Login from './pages/Login';
import WelcomeModal from './pages/WelcomeModal';
import SubscriptionPages from './pages/SubscriptionPages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicContextProvider, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { base, baseSepolia } from 'viem/chains';
import Header from './components/ui/Header';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { getSubscriptionState } from './store/authSlice';



const ProtectedRoute = ({ children }) => {
  const { isSubscribed, loading } = useSelector(state => state.auth);
  const username = useSelector(state => state.auth.username);
  console.log('username', username);
  const { primaryWallet } = useDynamicContext();
  // console.log('primaryWallet', primaryWallet);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!primaryWallet || !username) {
    return <Navigate to="/" />;
  }

  if (!isSubscribed) {
    return <Navigate to="/subscription" />;
  }
  return children;
};

function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  setPublicKey(useSelector(state => state.auth.publicKey));
  const queryClient = new QueryClient();
  const dynamicSettings = {
    environmentId: "83ff71ab-4c2e-4b74-b464-681e067c59ac",
    walletConnectors: [EthereumWalletConnectors],
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
    defaultNetwork: baseSepolia.id,
    cssOverride: {
      colors: {
        primary: '#3B82F6',
        secondary: '#1D4ED8',
      },
    },
  };
  useEffect(() => {
    setUsername(useSelector(state => state.auth.username));
    setPublicKey(primaryWallet?.address);
    console.log("publicKey", publicKey);
    }
, [primaryWallet]);
  const handleLogin = (user) => {
    // console.log("App component received user:", user);
    const primaryWallet = user.primaryWallet; // Access primaryWallet from the user object
    // console.log("Primary wallet:", primaryWallet);
    const address = primaryWallet?.address; // Safely access address
    setWalletAddress(address);
    setUsername(address?.slice(0, 7)); // Set username based on wallet address
    // console.log("Username:", username);
  };

  return (
    <Router>
      <Provider store={store}>
        <DynamicContextProvider settings={dynamicSettings}>
          <div className="max-h-100vh overflow-y-hidden">
            <Header />
            <QueryClientProvider client={queryClient}>
              <div className=" bg-gradient-to-br from-gray-50 to-indigo-100 flex items-center justify-center overflow-y-auto">
                <Routes>
                  <Route
                    path="/"
                    element={<Login onLogin={handleLogin} />}
                  />
                  <Route path="/subscription" element={<SubscriptionPages />} />
                  <Route
                    path="/chat"
                    element={username ?
                      <div style={{
                        backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pattern-01-qX0NjZaOV8g9QrnkzzOeFWx1ByjbJH.png')`,
                        backgroundRepeat: 'repeat',
                        height: '92vh',
                        width: '100vw',
                      }}>
                        {
                          <ProtectedRoute>
                          <ChatBox username={username} publicKey={publicKey} />
                          </ProtectedRoute>
                          }
                      </div>
                      :
                      <Navigate to="/" />}
                  />
                </Routes>
              </div>
            </QueryClientProvider>
          </div>
        </DynamicContextProvider>
      </Provider>

    </Router>
  );
}

export default App;

