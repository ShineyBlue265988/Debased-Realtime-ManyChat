import React, { useState } from "react";
import Login from "./components/Login";
import ChatBox from "./components/ChatBox";

function App() {
  const [username, setUsername] = useState(null);

  const handleLogin = (user) => {
    const baseName = user.baseName || user.walletAddress.slice(0, 7);
    setUsername(baseName);
  };

  return (
    <div className="App">
      {username ? <ChatBox username={username} /> : <Login onLogin={handleLogin} />}
    </div>
  );
}

export default App;