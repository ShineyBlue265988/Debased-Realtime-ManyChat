import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaArrowDown, FaEllipsisH, FaPaperPlane } from 'react-icons/fa'; // Import arrow icon and ellipsis icon
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import chaticon from '../components/icons/baseChat.jpg'
import { Menu } from '@headlessui/react';
import { Settings, AtSign, SmilePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "../components/ui/scroll-area";
import BasenameDisplay from '../components/ui/basename'; // Import the new component
import { useSelector } from "react-redux";
import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import axios from 'axios';
const ChatBox = ({ username, walletAddress }) => {
  const textareaRef = useRef(null);
  const backgroundUrl = import.meta.env.VITE_WS_URL;
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
  const scrollTimeoutRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const lastScrollPositionRef = useRef(0);
  const navigate = useNavigate();
  const [replyingTo, setReplyingTo] = useState(null);
  const [userAvatar, setUserAvatar] = useState('');
  username = useSelector(state => state.auth.username)
  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  //   async function fetchFromIPFSGateways(cid) {
  //     const gateways = [
  //       `https://cloudflare-ipfs.com/ipfs/${cid}`,
  //       `https://gateway.pinata.cloud/ipfs/${cid}`,
  //       `https://ipfs.io/ipfs/${cid}`,
  //       `https://dweb.link/ipfs/${cid}`
  //     ];

  //     for (const url of gateways) {
  //       try {
  //         const response = await axios.get(url);
  //         if (response.status === 200) {
  //           console.log(`Fetched data from ${url}`);
  //           console.log("response.data", response.data);
  //           return response.data;
  //         }
  //       } catch (error) {
  //         console.error(`Failed to fetch from ${url}:`, error.message);
  //       }
  //     }
  //     throw new Error(`Content not available on any public gateway for CID: ${cid}`);
  //   }

  //   const getText=async(message)=>{
  //     fetchFromIPFSGateways(message.cid)
  // .then(data => console.log('Data:', data.text))
  // .catch(console.error);
  // return data.text;
  //   }


  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  const handleUsernameClick = (username) => {
    setReplyingTo(username);
    const mentionToAdd = `@${username}`;
    setText(currentText => {
      if (currentText.includes(mentionToAdd)) {
        return currentText;
      }
      return `${currentText} ${mentionToAdd} `;
    });
  };
  const handleAtButtonClick = () => {
    // Get unique usernames from messages, excluding current user
    const uniqueUsers = [...new Set(messages.map(m => m.username))]
      .filter(u => u !== username)
      .slice(0, 5);

    setMentionUsers(uniqueUsers);
    setShowMentions(true);

    // Add @ to input if not already present
    setText(current => {
      const cursorPosition = current.length;
      return `${current}${current.endsWith(' ') ? '' : ' '}@`;
    });
  };

  const handleLogout = () => {
    // Your logout logic here
    navigate('/login');
  };
  const isOnlyEmojis = (text) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\s]+$/u;
    return emojiRegex.test(text);
  };
  const isAtBottom = () => {
    const container = messageContainerRef.current;
    console.log("container.scrollHeight", container.scrollHeight, "container.scrollTop", container.scrollTop, "container.clientHeight", container.clientHeight)

    if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) return true;
    else return false;

  };
  const handleEmojiSelect = (emoji) => {
    setText(text + emoji.native);
    setShowEmojiPicker(false);
  };
  const handleTextChange = (e) => {
    const newText = e.target.value.slice(0, 140);
      // Prevent consecutive "@" symbols
  if (newText.endsWith("@@")) {
    setText(newText.slice(0, -1));
    return;
  }
    setText(newText);
    // Log words starting with @
    const mentionedWords = newText.split(' ').filter(word => word.startsWith('@'));
    // console.log('Mentioned Users:', mentionedWords);
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
        )
        .slice(0, 5); //Limit to 5 users
      setMentionUsers(filtered);
    } else {
      setShowMentions(false);
      setMentionUsers([]);
    }
  };
  // Add this helper function to parse and format message text with mentions
  const formatMessageWithMentions = (text, isOwnMessage) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.map((word, index) => {
      if (word.startsWith('@')) {
        return (
          <span key={index}>
            <span className={`${isOwnMessage
              ? 'text-[#FFFFFF]'
              : 'text-[#007AFF]'
              } px-0.5 py-0.5 rounded-md font-bold`}>
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

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!messageContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      isNearBottomRef.current = isNearBottom;

      // Prevent navigation if at the top
      if (scrollTop === 0) {
        // Do nothing or handle as needed
        return;
      }

      setShowScrollButton(!isNearBottom);

      if (isNearBottom && newMessageCount > 0) {
        setNewMessageCount(0);
      }
    }, 100);
  }, [newMessageCount]);

  const scrollToBottom = (force = false) => {
    // if (messageContainerRef.current) {
    const container = messageContainerRef.current;
    const scrollHeight = container.scrollHeight;
    const height = container.clientHeight;
    const maxScrollTop = scrollHeight - height;

    container.scrollTop = maxScrollTop + 100; // Add extra padding to ensure full scroll
    // }
    setNewMessageCount(0);
    setShowScrollButton(false);
  };

  const handleNewMessage = (message) => {
    if (message.username === username) {
      // For own messages: just add message and scroll to bottom
      setMessages(prev => [...prev, message]);
      // console.log('Added own message:', message);
      setTimeout(() => scrollToBottom(true), 50); // Add delay to ensure DOM update
      setNewMessageCount(0); // Reset unread count
      scrollToBottom(true);
    } else {
      // For others' messages: check scroll position
      // const receivedMessage = {
      //   ...message,text: getText(message)}
      console.log("receivedMessage", message);
      setMessages(prev => [...prev, message]);
      // console.log('Added own message:', message);
      const bottomstate = isAtBottom()
      console.log("bottomstate", bottomstate);
      if (!bottomstate) {
        console.log('Scrolling to bottom', isAtBottom());
        setNewMessageCount(prev => prev + 1);
        setShowScrollButton(true);
      } else {
        console.log('Scrolling to bottom');
        setTimeout(() => scrollToBottom(true), 50);
        setNewMessageCount(0);
      }
    }
  };
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(backgroundUrl);
    console.log('WebSocket Connecting...', `${backgroundUrl}`);
    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
    ws.onopen = () => {
      console.log('WebSocket Connected');
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        if (data.type === 'history') {
          const reversedMessages = data.messages.reverse();
          const historyMessage = reversedMessages.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(historyMessage);
          setTimeout(() => scrollToBottom(true), 50);
        } else if (data.type === 'message' && !messageIds.current.has(data.message._id)) {
          messageIds.current.add(data.message._id);
          handleNewMessage(data.message);
          console.log('Added message:', data.message);
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
        console.log('WebSocket Closing...');
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
    console.log('Sending message:', JSON.stringify({
      username,
      publicKey: walletAddress,
      text: text.trim(),
      timestamp: new Date(),
      read: false,
      mentions: text.match(/@[\w]+/g) || []
    }));
    const newMessage = {
      _id: `temp-${Date.now()}`, // Temporary ID
      username,
      publicKey: walletAddress,
      text: text.trim(),
      timestamp: new Date(),
      read: false,
      mentions: text.match(/@[\w]+/g) || []
    };
    setMessages(prev => [...prev, newMessage]);

    console.log('Sending message:', JSON.stringify(newMessage));
    if (text.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        username,
        publicKey: walletAddress,
        text: text.trim(),
        timestamp: new Date(),
        read: false,
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
    <div className="flex flex-col overflow-hidden h-[92vh] p-0 w-full max-w-2xl mx-auto  relative">
      {/* <div className="flex items-center justify-between p-2 ">
        <div className="flex items-center">
          <span className="bg-transparent">
            <Identity
              address={walletAddress}
              schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
              chain={base}
              className="bg-transparent"
            >
              <Avatar className='w-8 h-8 bg-transparent' />
            </Identity>
          </span>
          <span className="text-green-700 text-xl bg-green-50 px-2 py-1">CurrentUser: {username}</span>
        </div>
      </div> */}

      {/* </div> */}
      {/* <ScrollArea 
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 space-y-4"
      > */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}

        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-100 scroll-smooth [scroll-behavior:smooth] [transition:all_10ms_ease-in-out]"
      >
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-start gap-2">
              <div className={`py-2 px-3 rounded-lg inline-block ${msg.username === username
                ? 'bg-[#007AFF] ml-auto max-w-[80%] p-2 text-white'
                : 'bg-[#FFFFFF] mr-auto max-w-[80%] p-2'
                } ${isOnlyEmojis(msg.text) && 'bg-transparent '}`}>
                {msg.username !== username && (
                  <div className="font-semibold text-blue-600 cursor-pointer hover:text-blue-800"
                    onClick={() => handleUsernameClick(msg.username)}
                  >
                    {msg.username}
                  </div>
                )}
                <div className="break-words">
                  {isOnlyEmojis(msg.text) ? (
                    <span className="text-6xl">{msg.text}</span>
                  ) : (
                    formatMessageWithMentions(msg.text, msg.username === username)
                  )}
                  <span className={`text-xs mt-1 ${(msg.username === username) && !isOnlyEmojis(msg.text) ? 'text-white/70' : 'text-gray-500'} `}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <div className="absolute bottom-32 right-4 flex flex-col items-center hover:scale-105 ">
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
      {/* </ScrollArea> */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-400 h-[80px]">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleAtButtonClick}
            className="p-2 rounded hover:scale-105 text-bold"
          >
            <AtSign className="h-6 w-6" />
          </button>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            id="inputMessage"
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg focus:outline-gray-300 outline-none w-full bg-inherit resize-none overflow-hidden"
            rows={1}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded hover:scale-105 text-bold"
          >
            <SmilePlus className="h-6 w-6" />
          </button>
          <button
            type="submit"
            className="px-6 py-2 w-18 h-10 items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaPaperPlane className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-0 z-50">
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

