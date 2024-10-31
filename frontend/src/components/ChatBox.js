import React, { useState, useEffect } from "react";

const parseMessage = (text) => {
    return text.replace(/:\)/g, "😊").replace(/http[s]?:\/\/[^\s]+/g, "(link not clickable)");
  };

const ChatBox = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const ws = new WebSocket("ws://localhost:5000");

  useEffect(() => {
    ws.onmessage = (event) => {
      const newMessages = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, ...newMessages].slice(-500));
    };
  }, [ws]);

  const sendMessage = () => {
    if (text.trim()) {
      ws.send(JSON.stringify({ username, text, timestamp: new Date() }));
      setText("");
    }
  };

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}</strong>: {msg.text}
          </div>
        ))}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;