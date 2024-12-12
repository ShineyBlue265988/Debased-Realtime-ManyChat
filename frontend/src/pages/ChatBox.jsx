import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaArrowDown,
  FaEllipsisH,
  FaPaperPlane,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa"; // Import arrow icon and ellipsis icon

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import ReCAPTCHA from "react-google-recaptcha";
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import { Settings, AtSign, SmilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LoadingMessage from "../components/ui/loadingmessage";
import VerifiedBadge from "../components/icons/bluebadge.png";
import NewbBadge from "../components/icons/newb.png";
import HodlerBadge from "../components/icons/hodler.png";
import ApeBadge from "../components/icons/ape.png";
import DegenBadge from "../components/icons/degen.png";
import AdminBadge from "../components/icons/admin.png";

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

  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [captchaValue, setCaptchaValue] = useState(true);
  const recaptchaRef = useRef(); // Ref for reCAPTCHA
  const [showCaptcha, setShowCaptcha] = useState("hidden"); // State to control CAPTCHA visibility
  const [messageCount, setMessageCount] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState(0);


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
  const [messageLikes, setMessageLikes] = useState({});
  const dataReceivedFlag = useRef(false);
  // const inputField = document.getElementById('inputMessage');

  const MESSAGE_LIMIT_INTERVAL = 5000; // 5 seconds
  const MESSAGE_LIMIT_COUNT = 5; // Allow 3 messages in 5 seconds
  const COOLDOWN_PERIOD = 20000; // 20 seconds cooldown after triggering CAPTCHA

  const forbiddenWords = ["spam", "nsfw", "nude"]; // Add more as needed

  username = useSelector((state) => state.auth.username);
  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  useEffect(() => {
    if (captchaValue != null) setShowCaptcha("hidden");
  }, [captchaValue]);

  const containsForbiddenWords = (text) => {
    return forbiddenWords.some((word) => text.toLowerCase().includes(word));
  };

  const onCaptchaChange = (value) => {
    setCaptchaValue(value);
    if (value) {
      setCooldownEnd(0); // Reset cooldown when CAPTCHA is solved
    }
  };

  const groupMessagesByDate = (messages) => {
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return messages.reduce((acc, message) => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  };
  const handleLike = useCallback(
    (messageId, messageUsername) => {
      // Update local state optimistically
      setMessageLikes((prev) => {
        const updatedLikes = { ...prev };
        const currentLikes = updatedLikes[messageId] || [];

        if (currentLikes.includes(username)) {
          // If username exists, remove it
          updatedLikes[messageId] = currentLikes.filter(
            (user) => user !== username
          );
        } else {
          // If username doesn't exist, add it
          updatedLikes[messageId] = [...currentLikes, username];
        }

        return updatedLikes;
      });

      wsRef.current.send(
        JSON.stringify({
          type: "like",
          username,
          messageId,
          messageUsername,
        })
      );
    },
    [username]
  );

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  const handleUsernameClick = (username) => {
    setReplyingTo(username);
    const mentionToAdd = `@${username}`;
    setText((currentText) => {
      if (currentText.includes(mentionToAdd)) {
        return currentText;
      }
      return `${currentText} ${mentionToAdd} `;
    });
  };
  const handleAtButtonClick = () => {
    // Get unique usernames from messages, excluding current user
    const uniqueUsers = [...new Set(messages.map((m) => m.username))]
      .filter((u) => u !== username)
      .slice(0, 5);

    setMentionUsers(uniqueUsers);
    setShowMentions(true);

    // Add @ to input if not already present
    setText((current) => {
      const cursorPosition = current.length;
      return `${current}${current.endsWith(" ") ? "" : " "}@`;
    });
  };

  const isOnlyEmojis = (text) => {
    const emojiRegex =
      /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\s]+$/u;
    return emojiRegex.test(text);
  };
  const isAtBottom = () => {
    const container = messageContainerRef.current;
    // console.log("container.scrollHeight", container.scrollHeight, "container.scrollTop", container.scrollTop, "container.clientHeight", container.clientHeight)

    if (
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 50
    )
      return true;
    else return false;
  };
  const handleEmojiSelect = (emoji) => {
    setText(text + emoji.native);
    setShowEmojiPicker(false);
  };
  const handleTextChange = (e) => {
    const newText = e.target.value.slice(0, 140);
    // Prevent consecutive "@" symbols
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      sendMessage(e); // Call the sendMessage function
      return;
    }
    if (newText.endsWith("@@")) {
      setText(newText.slice(0, -1));
      return;
    }
    setText(newText);
    // Log words starting with @
    const mentionedWords = newText
      .split(" ")
      .filter((word) => word.startsWith("@"));
    // console.log('Mentioned Users:', mentionedWords);
    const words = newText.split(" ");
    const currentWord = words[words.length - 1];

    // Handle mention suggestions
    if (currentWord.startsWith("@")) {
      const searchTerm = currentWord.slice(1);
      setShowMentions(true);
      const filtered = messages
        .map((m) => m.username)
        .filter((u, i, self) => self.indexOf(u) === i)
        .filter(
          (u) =>
            u.toLowerCase().includes(searchTerm.toLowerCase()) && u !== username
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
    if (!text) return "";
    const words = text.split(" ");
    return words.map((word, index) => {
      if (word.startsWith("@")) {
        return (
          <span key={index}>
            <span
              className={`${
                isOwnMessage ? "text-[#FFFFFF]" : "text-[#007AFF]"
              } px-0.5 py-0.5 rounded-md font-bold`}
            >
              {word}
            </span>{" "}
          </span>
        );
      }
      return word + " ";
    });
  };
  const handleMentionSelect = (user) => {
    const textBeforeMention = text.split("@").slice(0, -1).join("@");
    setText(`${textBeforeMention}@${user} `);
    setShowMentions(false);
  };

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!messageContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        messageContainerRef.current;
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
      setMessages((prev) => [...prev, message]);
      setTimeout(() => scrollToBottom(true), 50); // Add delay to ensure DOM update
      setNewMessageCount(0); // Reset unread count
      scrollToBottom(true);
    } else {
      setMessages((prev) => [...prev, message]);
      const bottomstate = isAtBottom();
      if (!bottomstate) {
        setNewMessageCount((prev) => prev + 1);
        setShowScrollButton(true);
      } else {
        setTimeout(() => scrollToBottom(true), 50);
        setNewMessageCount(0);
      }
    }
  };
  function updateLikes(messageID, userList) {
    setMessageLikes((prevLikes) => {
      const _prevLikes = { ...prevLikes };
      _prevLikes[messageID] = userList;
      return _prevLikes;
    });
  }
  function hasUserLiked(messageId, username) {
    return messageLikes[messageId]?.includes(username) ? true : false;
  }

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(backgroundUrl);
    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
    ws.onopen = () => {
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "history") {
          const sortedMessages = data.messages.sort(
            (a, b) => b.timestamp - a.timestamp
          );
          setMessages(sortedMessages); // Set sorted messages
          data.messages.forEach((message) => {
            messageIds.current.add(message._id);
            updateLikes(message._id, message.likes);
          });
          setTimeout(() => scrollToBottom(true), 50);
          dataReceivedFlag.current = true;
        } else if (
          data.type === "message" &&
          !messageIds.current.has(data.message._id)
        ) {
          messageIds.current.add(data.message._id);
          handleNewMessage(data.message);
        } else if (data.type === "likes") {
          const { messageId, likes } = data.message;
          updateLikes(messageId, likes);
        }
      } catch (error) {
        console.log("Message processing error:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected - Retrying in 3s");
      wsRef.current = null;
      setTimeout(connectWebSocket, 3000);
    };

    return ws;
  };

  useEffect(() => {
    const ws = connectWebSocket();
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("WebSocket Closing...");
        ws.close();
      }
    };
  }, []);
  
  useEffect(() => {
    if (cooldownEnd > Date.now()) {
      const timer = setInterval(() => {
        const remainingTime = Math.ceil((cooldownEnd - Date.now()) / 1000);
        if (remainingTime > 0) {
          toast.info(`Cooldown: ${remainingTime} seconds remaining`, { toastId: 'cooldown' });
        } else {
          toast.success("You can now send messages again.", { toastId: 'cooldown-end' });
          clearInterval(timer);
        }
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [cooldownEnd]);
  const sendMessage = (e) => {
    e?.preventDefault();

    const currentTime = Date.now();

    if (currentTime < cooldownEnd) {
      const remainingTime = Math.ceil((cooldownEnd - currentTime) / 1000);
      toast.error(`Please wait ${remainingTime} seconds before sending another message.`);
      return;
    }


    // Rate limiting check
    if (currentTime - lastMessageTime < MESSAGE_LIMIT_INTERVAL) {
      setMessageCount((prevCount) => prevCount + 1);
      if (messageCount >= MESSAGE_LIMIT_COUNT) {
        setShowCaptcha(""); // Show CAPTCHA when rate limit is exceeded
        setCooldownEnd(currentTime + COOLDOWN_PERIOD);
        toast.error("You are sending messages too quickly. Please complete the CAPTCHA and wait.");
        recaptchaRef.current.reset(); // Reset CAPTCHA widget
        setCaptchaValue(null);
        return;
      }
    } else {
      setMessageCount(1); // Reset count if interval has passed
    }

    setLastMessageTime(currentTime);

    // Check for forbidden words
    if (containsForbiddenWords(text)) {
      toast.error("Your message contains inappropriate content.");
      return;
    }

    if (showCaptcha =='' && !captchaValue) {
      toast.error("Please complete the CAPTCHA.");
      return;
    }

    // Validate no links or images
    if (
      text.match(/(http|https):\/\/[^\s]+/) ||
      text.match(/\.(jpg|jpeg|png|gif)/i)
    ) {
      return;
    }
    const newMessage = {
      username,
      publicKey: walletAddress,
      text: text.trim(),
      timestamp: new Date(),
      read: false,
      mentions: text.match(/@[\w]+/g) || [],
    };

    if (text.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "message",
          username,
          publicKey: walletAddress,
          text: text.trim(),
          timestamp: new Date(),
          read: false,
          mentions: text.match(/@[\w]+/g) || [],
        })
      );
      setText("");
      setNewMessageCount(0);
      // setShowCaptcha("hidden"); // Hide CAPTCHA after successful send
      // setCaptchaValue(true);
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop =
            messageContainerRef.current.scrollHeight;
        }
      }, 20);
    }
  };
  if (!dataReceivedFlag.current) return <LoadingMessage />;
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col overflow-hidden h-[92vh] p-0 w-full max-w-2xl mx-auto  relative">
      <ToastContainer className={'top-[20%]'}/>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey="6Lfp1JgqAAAAAMpwNfQorQhGpTtB2jWzrlgbKTOM"
        onChange={onCaptchaChange}
        className={`${showCaptcha} `}
      />
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-100 scroll-smooth [scroll-behavior:smooth] [transition:all_10ms_ease-in-out]"
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="py-2">
            <div className="text-gray-500 text-center my-2 ">{date}</div>{" "}
            {/* Display date */}
            {msgs.map((msg, index) => (
              <div key={index} className="flex flex-col py-1 pr-3">
                <div className="flex items-start gap-2">
                  <div
                    className={`py-2 pl-3 pr-12 rounded-lg inline-block relative ${
                      msg.username === username
                        ? "bg-[#007AFF] ml-auto max-w-[80%]  text-white"
                        : "bg-[#FFFFFF] mr-auto max-w-[80%] "
                    } ${isOnlyEmojis(msg.text) && "bg-transparent "}`}
                  >
                    {msg.username !== username && (
                      <div
                        className="font-semibold text-blue-600 cursor-pointer hover:text-blue-800 flex items-center"
                        onClick={() => handleUsernameClick(msg.username)}
                      >
                        {msg.username}
                        <div className="flex items-center p-1">
                          {msg.badge == "AdminBadge" && (
                            <img
                              src={AdminBadge}
                              className="w-6 h-6 inline-block "
                              alt="Admin2"
                            />
                          )}
                          {msg.badge == "VerifiedBadge" && (
                            <img
                              src={VerifiedBadge}
                              className="w-6 h-6 inline-block "
                              alt="Verified"
                            />
                          )}
                          {msg.badge == "NewbBadge" && (
                            <img
                              src={NewbBadge}
                              className="w-6 h-6 inline-block "
                              alt="Newb"
                            />
                          )}
                          {msg.badge == "HodlerBadge" && (
                            <img
                              src={HodlerBadge}
                              className="w-6 h-6 inline-block "
                              alt="Hodler"
                            />
                          )}
                          {msg.badge == "ApeBadge" && (
                            <img
                              src={ApeBadge}
                              className="w-6 h-6 inline-block "
                              alt="Ape"
                            />
                          )}
                          {msg.badge == "DegenBadge" && (
                            <img
                              src={DegenBadge}
                              className="w-6 h-6 inline-block "
                              alt="Degen"
                            />
                          )}
                        </div>
                      </div>
                    )}
                    <div className="break-words ">
                      {isOnlyEmojis(msg.text) ? (
                        <span className="text-6xl">{msg.text}</span>
                      ) : (
                        formatMessageWithMentions(
                          msg.text,
                          msg.username === username
                        )
                      )}
                      <span
                        className={`text-xs mt-1 ${
                          msg.username === username && !isOnlyEmojis(msg.text)
                            ? "text-white/70"
                            : "text-gray-500"
                        } `}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`flex items-end mt-1 p-1 justify-end absolute bottom-0.5 right-1 `}
                    >
                      <motion.div
                        className={`relative group flex  `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.button
                          onClick={() => handleLike(msg._id, msg.username)}
                          className="text-xl relative"
                        >
                          <AnimatePresence mode="wait">
                            {messageLikes[msg._id]?.includes(username) ? (
                              <motion.div
                                key="liked"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.3, type: "spring" }}
                              >
                                <FaHeart className="text-red-500 w-4 h-4" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="unliked"
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -180 }}
                                transition={{ duration: 0.3, type: "spring" }}
                              >
                                <FaRegHeart className="text-gray-400 group-hover:text-pink-400 w-4 h-4" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        {messageLikes[msg._id]?.length > 0 && (
                          <motion.div
                            className={`rounded-full  text-xs font-bold pl-1 flex items-center justify-center 
                        ${
                          messageLikes[msg._id]?.includes(username)
                            ? "text-red-500"
                            : "text-gray-400"
                        }
                        `}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                          >
                            {messageLikes[msg._id]?.length}
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-400 h-[80px]"
      >
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
            onKeyDown={handleTextChange}
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
              {mentionUsers.map((user) => (
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
