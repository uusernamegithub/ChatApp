import React, { useState, useEffect } from "react";
import ChatSection from "./ChatSection";
import Navbar from "./Navbar";
import io from "socket.io-client";
import '../styles/Home.css'; // Import the CSS file

const Home = ({ selectedChatId, setSelectedChatId,selectedChatpic }) => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");
  const [socket, setSocket] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3256";

  useEffect(() => {
    const newSocket = io(API_BASE_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      ("Connected to Socket.IO server");
    });

    newSocket.on("disconnect", () => {
      ("Socket.IO disconnected");
    });

    newSocket.emit('setup', userId);
    newSocket.on('connected', () => {
      ('opened a user room in ' + userId);
    });

    return () => {
      newSocket.disconnect();
      ("Socket.IO disconnected");
    };
  }, [API_BASE_URL]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE_URL}/chatApp/v1/chat`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch chats");
          }
          return response.json();
        })
        .then((data) => {
          setChats(data);
        })
        .catch((err) => {
          setError("Error fetching chats: " + err.message);
          console.error(err);
        });
    } else {
      setError("No token found.");
    }
  }, [API_BASE_URL]);

  const handleChatClick = (chatId) => {
    setSelectedChatId(chatId);
  };

  const handleBackClick = () => {
    setSelectedChatId(null); // Reset the selected chat
  };

  return (
    <div className="Home">
      <Navbar selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} imgLink={selectedChatpic}/>
      <div className="home-container">
        {/* Chat List */}
        <div className={`chat-list-container ${selectedChatId ? "hidden" : ""}`}>
          {error && <p className="error-message">{error}</p>}
          {chats.length === 0 ? (
            <p>No chats available</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatClick(chat._id)}
                className={`chat-item ${chat.isGroupChat ? "group-chat" : "user-chat"}`}
              >
                <h2 className="chat-title">
                  {chat.chatName === "sender"
                    ? chat.users.map((user) =>
                        user._id !== userId ? (
                          <span
                            key={user._id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <img
                              src={user.pic}
                              alt={user.name}
                              className="chat-user-image"
                            />
                            {user.name}
                          </span>
                        ) : null
                      )
                    : chat.chatName}
                </h2>
                {chat.latestMessage ? (
                  <div className="last-message">
                    <p>
                      {chat.latestMessage.sender.name} : {chat.latestMessage.content}
                    </p>
                  </div>
                ) : (
                  <p>No messages yet</p>
                )}
              </div>
            ))
          )}
        </div>
        {/* Chat Section */}
        <div className={`chat-section-container ${selectedChatId ? "active" : ""}`}>
          {selectedChatId && (
            <>
              <ChatSection chatId={selectedChatId} socket={socket} handleBackClick={handleBackClick} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
