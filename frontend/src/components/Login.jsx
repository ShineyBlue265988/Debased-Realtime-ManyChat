import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicContextProvider, DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import WelcomeModal from './WelcomeModal';
import { ethers } from 'ethers';

const Login = ({ onLogin }) => {
  const [showWidget, setShowWidget] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();
  const { primaryWallet,setShowAuthFlow } = useDynamicContext();

  // Use ethers v5 syntax
  const provider = new ethers.BrowserProvider(window.ethereum);

    const getUsername = async (address) => {
    try {
      const ensName = await provider.lookupAddress(address);
      console.log('ENS name:', ensName);
      if (ensName) {
        return ensName; // Use the ENS name if available
      } else {
        return address.substring(0, 7); // Fallback to first 5 chars of address
      }
    } catch (error) {
      return address.substring(0, 7); // Fallback if ENS lookup fails
    }
  };
  useEffect(() => {
    if (!primaryWallet) {
      setShowWidget(false);
    }
  }, [primaryWallet]);
  const CustomButton = () => (
    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 hovewr:scale-105" onClick={() => setShowAuthFlow(true)}>
      Connect Your Wallet
    </button>
  );
  useEffect(() => {
    console.log('primaryWallet', primaryWallet);
    if (primaryWallet) {
      setWalletAddress(primaryWallet.address);
      console.log('primaryWallet address:', primaryWallet.address);
      const username = getUsername(primaryWallet.address);
      onLogin({ username, primaryWallet });
      // setModalOpen(true);
      // navigate('/chat'); // Uncomment if you want to navigate here
    }
  }, [primaryWallet, onLogin, navigate]);
  const handleLogin = () => {
    setShowWidget(true);
    setShowAuthFlow(true)
    // setShowConnectModal(true); // This directly opens the wallet connection modal
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Chat</h1>
        
        {!showWidget ? (
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Login with Wallet
          </button>
        ) : (
          <>
          {primaryWallet && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-center">
            <p className="text-sm text-gray-600">Connected Wallet</p>
          </div>
            )}
            <DynamicWidget 
              // buttonClassName="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              innerButtonComponent={CustomButton}
              // buttonText="Connect Wallet"
            />
            {primaryWallet && (
              <button
                onClick={() => navigate('/chat')}
                className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 hover:scale-105"
              >
                Continue
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const LoginWrapper = ({ onLogin }) => {
  const dynamicSettings = {
    environmentId: "83ff71ab-4c2e-4b74-b464-681e067c59ac",
    walletConnectors: [EthereumWalletConnectors],
    cssOverride: {
      colors: {
        primary: '#3B82F6',
        secondary: '#1D4ED8'
      }
    }
  };
  return (
    <DynamicContextProvider settings={dynamicSettings}>
      <Login onLogin={onLogin} />
    </DynamicContextProvider>
  );
};

export default LoginWrapper;