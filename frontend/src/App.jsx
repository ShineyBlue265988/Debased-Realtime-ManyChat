import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ChatBox from './components/ChatBox';
import LoginWrapper from './components/Login';
import WelcomeModal from './components/WelcomeModal';

function App() {
  const [username, setUsername] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const handleLogin = (user) => {
    console.log("App component received user:", user);
    const primaryWallet = user.primaryWallet; // Access primaryWallet from the user object
    console.log("Primary wallet:", primaryWallet);
    const address = primaryWallet?.address; // Safely access address
    setWalletAddress(address);
    setUsername(address?.slice(0, 7)); // Set username based on wallet address
  };

  useEffect(() => {
    console.log("Current user:", username);
  }, [username]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Routes>
          <Route 
            path="/" 
            element={<LoginWrapper onLogin={handleLogin} />} 
          />
          <Route 
            path="/chat" 
            element={username ? <ChatBox username={username} walletAddress={walletAddress} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;