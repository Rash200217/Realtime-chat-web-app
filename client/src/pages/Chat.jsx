import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import SearchUserModal from "../components/SearchUserModal"; // Import Modal
import {
  MdChat,
  MdMoreVert,
  MdSearch,
  MdAttachFile,
  MdSentimentSatisfied,
  MdSend,
  MdArrowBack,
  MdDoneAll,
  MdLogout,
  MdClose,
  MdInsertDriveFile,
  MdImage,
  MdPersonAdd,
  MdAdminPanelSettings,
} from "react-icons/md";

const socket = io(); // Connect to same origin (proxied by Nginx)

const Chat = () => {
  const { user, logout } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Now stores full Chat Object
  const [chatList, setChatList] = useState([]); // Real chat list from DB
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false); // Modal state
  const [activeTab, setActiveTab] = useState("all"); 
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set()); // Set of usernames typing
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Initial Socket & Data Fetch
  useEffect(() => {
    if (user) {
      if (!socket.connected) socket.connect();
      socket.emit("user_connected", user.id);
      fetchChats();
    }

    socket.on("user_status", ({ userId, status }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === "online") newSet.add(userId);
        else newSet.delete(userId);
        return newSet;
      });
    });

    socket.on("receive_message", (data) => {
      // 1. Play Sound if message is from others
      if (data.senderId !== user.id) {
        // Synthesize a short "bamboo" / "wood block" sound
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      }

      // 2. If chat is active, append message
      if (activeChat && (data.room === activeChat._id || data.room === "general")) {
        setMessageList((list) => {
           if (list.some(msg => msg.id === data.id)) return list;
           return [...list, data];
        });
      }
      // 3. Refresh chat list to update "last message"
      fetchChats();
    });

    socket.on("display_typing", (data) => {
      if (data.senderId !== user.id) {
         setTypingUsers(prev => new Set(prev).add(data.username));
      }
    });

    socket.on("hide_typing", (data) => {
       setTypingUsers(prev => {
         const newSet = new Set(prev);
         newSet.delete(data.username);
         return newSet;
       });
    });

    return () => {
      socket.off("user_status");
      socket.off("receive_message");
      socket.off("display_typing");
      socket.off("hide_typing");
    };
  }, [user, activeChat]);

  // 2. Fetch Chats
  const fetchChats = async () => {
    try {
      const res = await API.get(`/chat/${user.id}`);
      setChatList(res.data);
    } catch (err) {
      console.error("Failed to fetch chats", err);
    }
  };

  // 3. Join Room when Active Chat changes
  useEffect(() => {
    if (activeChat) {
      const roomId = activeChat._id;
      socket.emit("join_room", roomId);
      API.get(`/chat/messages/${roomId}`).then((res) => setMessageList(res.data));
      setMessageList([]); // Clear previous messages while loading
      scrollToBottom();
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  // 4. Typing Handler
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (activeChat) {
      socket.emit("typing", { room: activeChat._id, senderId: user.id, username: user.username });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
         socket.emit("stop_typing", { room: activeChat._id, senderId: user.id, username: user.username });
      }, 2000);
    }
  };

  const sendMessage = async () => {
    if (message !== "" && activeChat) {
      const messageData = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        room: activeChat._id, // Use real Chat ID
        senderId: user.id,
        sender: { username: user.username },
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text",
      };
      
      await socket.emit("send_message", messageData);
      socket.emit("stop_typing", { room: activeChat._id, senderId: user.id, username: user.username });
      
      setMessageList((list) => [...list, messageData]);
      setMessage("");
      setShowEmojiPicker(false);
      fetchChats(); // Update sidebar last message immediately
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileUpload = (e) => {
    // ... File upload logic remains mostly same, just ensure room is activeChat._id
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const messageData = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        room: activeChat._id,
        senderId: user.id,
        sender: { username: user.username },
        content: reader.result,
        fileName: file.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: file.type.startsWith("image/") ? "image" : "file",
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]); 
      setShowAttachMenu(false);
      fetchChats();
    };
    reader.readAsDataURL(file);
  };

  // 5. Start New Chat from Search
  const handleStartChat = async (selectedUser) => {
    try {
      const res = await API.post("/chat", { senderId: user.id, receiverId: selectedUser._id });
      setChatList(prev => [res.data, ...prev.filter(c => c._id !== res.data._id)]);
      setActiveChat(res.data);
      setShowSearchModal(false);
    } catch (err) {
      console.error("Error starting chat", err);
    }
  };
  
  // Helper to get other participant name
  const getChatName = (chat) => {
     if (chat.isGroup) return chat.groupName;
     const other = chat.participants.find(p => p._id !== user.id);
     return other ? other.username : "Unknown User";
  };
  
  // Helper to get other participant status
  const isOnline = (chat) => {
     if (chat.isGroup) return false;
     const other = chat.participants.find(p => p._id !== user.id);
     return other ? onlineUsers.has(other._id) || other.isOnline : false; // Check socket Set or DB status
  };

  const handleLogout = () => {
    socket.disconnect();
    logout();
  };

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden relative text-text-primary font-sans">
      {/* Search Modal */}
      {showSearchModal && (
        <SearchUserModal onClose={() => setShowSearchModal(false)} onSelectUser={handleStartChat} />
      )}

      {/* Background Pattern Overlay */}
      <div className="absolute top-0 w-full h-32 bg-secondary -z-10 hidden md:block"></div>

      {/* Main Container */}
      <div className="z-10 w-full h-full flex overflow-hidden">
        <div className="bg-panel-bg w-full h-full flex shadow-2xl overflow-hidden md:rounded-lg border border-gray-800">
          
          {/* Sidebar (Left Pane) */}
          <div className={`${activeChat ? "hidden md:flex" : "flex"} w-full md:w-[400px] border-r border-gray-700 flex-col bg-panel-bg`}>
            
            {/* Sidebar Header */}
            <div className="bg-panel-bg h-16 p-4 flex justify-between items-center border-b border-gray-700">
              <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden cursor-pointer">
                 <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                 </div>
              </div>
                <div className="flex gap-4 items-center">
                {user?.role === "admin" && (
                  <button 
                    title="Admin Dashboard" 
                    onClick={() => window.location.href = "/admin"}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <MdAdminPanelSettings size={24} />
                  </button>
                )}
                <button 
                  title="New Chat" 
                  onClick={() => setShowSearchModal(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MdChat size={24} />
                </button>
                <button onClick={handleLogout} title="Logout" className="text-gray-400 hover:text-red-500 transition-colors">
                  <MdLogout size={20} />
                </button>
              </div>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex items-center justify-around p-2 border-b border-gray-700 text-sm font-medium text-gray-400">
               {["All", "DMs", "Groups"].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab.toLowerCase())}
                   className={`px-4 py-2 rounded-full transition-all ${activeTab === tab.toLowerCase() ? "bg-input-bg text-white" : "hover:text-white"}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            {/* Chat List (Real Data) */}
            <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Chats</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {chatList.length > 0 ? chatList.map((chat) => (
                <div 
                  key={chat._id} 
                  onClick={() => setActiveChat(chat)}
                  className={`flex items-center gap-3 p-3 px-4 cursor-pointer hover:bg-input-bg transition-colors border-b border-transparent group ${activeChat?._id === chat._id ? "bg-input-bg border-l-4 border-l-primary" : ""}`}
                >
                  <div className="relative w-12 h-12">
                    <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                      <span className="text-gray-300 text-xl font-bold">{getChatName(chat).charAt(0).toUpperCase()}</span>
                    </div>
                    {/* Online Dot */}
                    {isOnline(chat) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-panel-bg"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-semibold text-white truncate">{getChatName(chat)}</span>
                      <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                        {chat.lastMessage?.time ? new Date(chat.lastMessage.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400 truncate pr-2">
                         {chat.lastMessage?.type === "image" ? "📷 Image" : 
                          chat.lastMessage?.type === "file" ? "📎 Attachment" : 
                          chat.lastMessage?.content || "Start conversation"}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 mt-10 p-4">
                   No chats yet. Click the <MdChat className="inline" /> icon to start one!
                </p>
              )}
            </div>
          </div>

          {/* Chat Window (Right Pane) */}
          <div className={`${!activeChat ? "hidden md:flex" : "flex"} flex-col flex-1 bg-chat-bg relative min-w-0`}>
             <div className="absolute inset-0 bg-cover bg-center opacity-[0.15] pointer-events-none" style={{ backgroundImage: "url('/chat-bg.png')" }}></div>

             {activeChat ? (
               <>
                 {/* Chat Header */}
                 <div className="bg-panel-bg h-16 p-4 flex justify-between items-center border-b border-gray-700 z-10 w-full">
                    <div className="flex items-center gap-4 cursor-pointer">
                       <button onClick={() => setActiveChat(null)} className="md:hidden text-gray-400">
                         <MdArrowBack size={24} />
                       </button>
                       <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          <span className="text-gray-300 font-bold">
                            {getChatName(activeChat).charAt(0).toUpperCase()}
                          </span>
                       </div>
                       <div>
                          <h3 className="font-semibold text-white">
                            {getChatName(activeChat)}
                          </h3>
                          <p className="text-xs text-primary truncate w-32 md:w-auto h-4">
                             {/* Show Typing Status OR Online Status */}
                             {typingUsers.size > 0 && [...typingUsers].some(u => u !== user.username) ? (
                               <span className="text-primary animate-pulse">typing...</span>
                             ) : isOnline(activeChat) ? (
                               <span className="text-green-500">Online</span>
                             ) : (
                               <span className="text-gray-500">Offline</span>
                             )}
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-4 text-gray-400">
                       <button className="hover:text-white"><MdSearch size={24} /></button>
                       <button className="hover:text-white"><MdMoreVert size={24} /></button>
                    </div>
                 </div>

                 {/* Messages Area */}
                 <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 z-10 custom-scrollbar relative">
                    {messageList.map((msg, index) => {
                      const isMe = msg.sender?.username === user.username || msg.senderId === user.id; // Check both styles
                      return (
                        <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                           <div className={`
                              relative max-w-[85%] md:max-w-[65%] rounded-2xl p-3 shadow-md text-sm 
                              ${isMe ? "text-white rounded-br-none" : "text-text-primary rounded-bl-none"}
                           `}
                           style={{ backgroundColor: isMe ? "#3b82f6" : "#1f2937" }}>
                              
                              {!isMe && <p className="text-xs font-bold text-primary mb-1">{msg.sender?.username || "User"}</p>}
                              
                              {msg.type === "image" && (
                                <img src={msg.content} alt="attachment" className="rounded-lg mb-2 max-w-full h-auto" />
                              )}
                              
                              {msg.type === "file" && (
                                <a 
                                  href={msg.content} 
                                  download={msg.fileName || "document.pdf"}
                                  className="flex items-center gap-2 bg-black/20 p-2 rounded mb-2 cursor-pointer hover:bg-black/30 transition-colors"
                                >
                                  <MdInsertDriveFile size={24} className="text-white shrink-0" />
                                  <div className="flex flex-col overflow-hidden">
                                     <span className="truncate max-w-[150px] text-white font-medium text-sm">
                                       {msg.fileName || "Document"}
                                     </span>
                                     <span className="text-[10px] text-gray-300 uppercase">PDF / DOC</span>
                                  </div>
                                </a>
                              )}

                              {(!msg.type || msg.type === "text") && (
                                <p className="leading-relaxed break-words text-[15px]">{msg.content}</p>
                              )}

                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] opacity-70">
                                  {msg.time && msg.time.includes(":") ? msg.time.substring(0, 5) : "12:00"}
                                </span>
                                {isMe && <MdDoneAll size={14} className="text-message-blue" />}
                              </div>
                           </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                 </div>

                 {/* Input Area */}
                 <div className="bg-panel-bg p-3 z-20 border-t border-gray-700 relative">
                    {/* Popovers ... (Same as before) */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-16 left-4 z-30 shadow-2xl rounded-lg overflow-hidden">
                        <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} />
                      </div>
                    )}
                    {showAttachMenu && (
                      <div className="absolute bottom-16 left-16 z-30 bg-gray-800 rounded-lg shadow-xl p-2 flex flex-col gap-2">
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded text-white">
                          <MdImage className="text-purple-400" size={20} /> Image
                        </button>
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded text-white">
                          <MdInsertDriveFile className="text-red-400" size={20} /> Document
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                      </div>
                    )}

                    <div className="flex items-end gap-2 md:gap-4">
                      <button 
                         onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                         className={`p-2 transition-colors ${showEmojiPicker ? "text-primary" : "text-gray-400 hover:text-white"}`}
                      >
                        <MdSentimentSatisfied size={26} />
                      </button>
                      <button 
                         onClick={() => setShowAttachMenu(!showAttachMenu)}
                         className={`p-2 transition-colors ${showAttachMenu ? "text-primary" : "text-gray-400 hover:text-white"}`}
                      >
                         <MdAttachFile size={26} className="transform rotate-45" />
                      </button>
                      
                      <div className="flex-1 bg-input-bg rounded-xl flex items-center px-4 py-2 min-h-[46px]">
                        <input
                          type="text"
                          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-[15px]"
                          placeholder="Type a message..."
                          value={message}
                          onChange={handleTyping}
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          onFocus={() => { setShowEmojiPicker(false); setShowAttachMenu(false); }}
                        />
                      </div>

                      <button 
                        onClick={sendMessage} 
                        className={`p-3 rounded-full transition-all ${message ? "bg-primary text-white hover:bg-orange-600 shadow-lg" : "bg-gray-700 text-gray-400"}`}
                      >
                        <MdSend size={22} />
                      </button>
                    </div>
                 </div>
               </>
             ) : (
               /* Generic Empty State */
               <div className="flex-1 flex flex-col items-center justify-center text-center p-10 z-10 text-text-secondary">
                  <div className="w-32 h-32 mb-6 bg-gray-800 rounded-full flex items-center justify-center text-gray-600 animate-pulse">
                    <MdChat size={64} />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to ModernChat</h2>
                  <p className="max-w-md text-sm opacity-70">
                    Select a conversation or start a new one to connect with your friends.
                  </p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Chat;
