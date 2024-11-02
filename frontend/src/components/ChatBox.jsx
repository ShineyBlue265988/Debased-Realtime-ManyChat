import React, { useState, useEffect, useRef } from "react";
import { FaArrowDown } from 'react-icons/fa'; // Import arrow icon
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

const ChatBox = ({ username, walletAddress }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionUsers, setMentionUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const messageIds = useRef(new Set());
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const wsRef = useRef(null);


  const isAtBottom = () => {
    const container = messageContainerRef.current;
    return container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
  };
  const handleEmojiSelect = (emoji) => {
    setText(text + emoji.native);
    setShowEmojiPicker(false);
  };
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
      // Log words starting with @
  const mentionedWords = newText.split(' ').filter(word => word.startsWith('@'));
  console.log('Mentioned Users:', mentionedWords);
    const words = newText.split(' ');
    const currentWord = words[words.length - 1];
  
    // Handle mention suggestions
    if (currentWord.startsWith('@')) {
      const searchTerm = currentWord.slice(1);
      setShowMentions(true);
      const filtered = messages
        .map(m => m.username)
        .filter((u, i, self) => self.indexOf(u) === i)
        .filter(u => 
          u.toLowerCase().includes(searchTerm.toLowerCase()) && 
          u !== username
        );
      setMentionUsers(filtered);
    } else {
      setShowMentions(false);
      setMentionUsers([]);
    }
  };
  // Add this helper function to parse and format message text with mentions
  const formatMessageWithMentions = (text) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      if (word.startsWith('@')) {
        return (
          <span key={index}>
            <span className="text-blue-500 font-semibold hover:underline">
              {word}
            </span>{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };
  const handleMentionSelect = (user) => {
    const textBeforeMention = text.split('@').slice(0, -1).join('@');
    setText(`${textBeforeMention}@${user} `);
    setShowMentions(false);
  };

  const handleScroll = () => {
    const isCurrentlyAtBottom = isAtBottom();
    setShowScrollButton(!isCurrentlyAtBottom);
    
    if (isCurrentlyAtBottom) {
      setNewMessageCount(0);
    }
  };
// Add this helper function to format the input text
const highlightMentions = (text) => {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span key={index} className="bg-blue-200 text-blue-700 px-1 rounded">
          {part}
        </span>
      );
    }
    return part;
  });
};
  const scrollToBottom = (force = false) => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const height = container.clientHeight;
      const maxScrollTop = scrollHeight - height;
      
      container.scrollTop = maxScrollTop ; // Add extra padding to ensure full scroll
    }
    setNewMessageCount(0);
    setShowScrollButton(false);
};

  const handleNewMessage = (message) => {
    if (message.username === username) {
      // For own messages: just add message and scroll to bottom
      setMessages(prev => [...prev, message]);
      setTimeout(() => scrollToBottom(true), 100); // Add delay to ensure DOM update
      setNewMessageCount(0); // Reset unread count
      scrollToBottom(true);
    } else {
      // For others' messages: check scroll position
      setMessages(prev => [...prev, message]);
      if (!isAtBottom()) {

        setTimeout(() => scrollToBottom(true), 150);
      } else {
        setNewMessageCount(0);
        setShowScrollButton(false);
        scrollToBottom(true);
      }
    }
  };
const getInputStyle = (text) => {
  const words = text.split(' ');
  const hasMention = words.some(word => word.startsWith('@'));
  return hasMention ? 'bg-blue-50' : '';
};


  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket("ws://192.168.142.160:5000");

    ws.onopen = () => {
      console.log('WebSocket Connected');
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'history') {
          setMessages(data.messages);
          scrollToBottom(true);
        } else if (data.type === 'message' && !messageIds.current.has(data.message._id)) {
          messageIds.current.add(data.message._id);
          handleNewMessage(data.message);
        }
      } catch (error) {
        console.log('Message processing error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected - Retrying in 3s');
      wsRef.current = null;
      setTimeout(connectWebSocket, 3000);
    };

    return ws;
  };

  useEffect(() => {
    const ws = connectWebSocket();
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (e) => {
    e?.preventDefault();
    // Validate no links or images
    if (text.match(/(http|https):\/\/[^\s]+/) || text.match(/\.(jpg|jpeg|png|gif)/i)) {
      return;
    }
    if (text.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            username,
            publicKey: walletAddress,
            text: text.trim(),
            timestamp: new Date(),
            mentions: text.match(/@[\w]+/g) || []
        }));
        setText("");
        setNewMessageCount(0);
        
        // Add small delay to ensure DOM update
        setTimeout(() => {
            if (messageContainerRef.current) {
                messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
            }
        }, 20);
    }
};

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg relative">
      <div className="p-4 border-b bg-blue-500 text-white rounded-t-xl">
        <h2 className="text-xl font-bold">Current User: {username}</h2>
      </div>
      <div 
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth [scroll-behavior:smooth] [transition:all_10ms_ease-in-out]"
      >
      {messages.map((msg, index) => (
        <div key={index} className="flex flex-col">
          <div
            className={`py-1 px-2 rounded-lg inline-block ${
                msg.username === username
                    ? 'bg-blue-100 ml-auto max-w-[80%] pr-5'
                    : 'bg-gray-100 mr-auto max-w-[80%] pl-2'
            }`}
          >
          {msg.username !== username && <div className="font-semibold text-blue-600">{msg.username}</div>}
          <div className=" break-words">{formatMessageWithMentions(msg.text)}</div>
        </div>
      </div>
          
      ))}
        <div ref={messagesEndRef} />
      </div>
      
      {showScrollButton && (
        <div className="absolute bottom-20 right-4 flex flex-col items-center hover:scale-105 ">
          {newMessageCount > 0 && (
            <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mb-1 translate-x-3 translate-y-5">
              {newMessageCount}
            </div>
          )}
          <button
            onClick={() => scrollToBottom(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg"
          >
            <FaArrowDown />
          </button>
        </div>
      )}

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
        <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded hover:bg-gray-100"
          >
            😊
          </button>
          <input
            value={text}
            onChange={handleTextChange}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            style={{
              caretColor: 'black',
              color: 'black',
              textShadow: text.split(' ')
                .map(word => word.startsWith('@') ? `0 0 0 #2563EB` : '')
                .join(' ')
               
            }}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-20">
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect}
                theme="light"
              />
            </div>
          )}
        {showMentions && mentionUsers.length > 0 && (
          <div className="absolute bottom-20 bg-white border rounded-lg shadow-lg">
            {mentionUsers.map(user => (
              <div
                key={user}
                onClick={() => handleMentionSelect(user)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                @{user}
              </div>
            ))}
          </div>
        )}
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
