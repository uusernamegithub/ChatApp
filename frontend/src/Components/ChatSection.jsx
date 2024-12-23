import React, { useState, useEffect } from "react";
import "../styles/ChatSection.css";
import GroupEdit from "./GroupEdit";
import Lottie from "react-lottie";
import animationData from "../TypingAnimation.json";


const ChatSection = ({ chatId, socket, handleBackClick }) => {
  const [messages, setMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const token = localStorage.getItem("token");
  const userId = token ? localStorage.getItem("userId") : null;
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  // Join/Leave chat effect
  useEffect(() => {
    if (!chatId) return;

    socket.emit("join chat", chatId);
    console.log(`Joined chat: ${chatId}`);

    return () => {
      socket.emit("leave chat", chatId);
      console.log(`Left chat: ${chatId}`);
    };
  }, [chatId, socket]);

  // Fetch messages effect
  useEffect(() => {
    if (token) {
      fetch(`https://chat-appliacation.onrender.com/chatApp/v1/message/${chatId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          return response.json();
        })
        .then((data) => {
          setChatDetails(data.chatDetails);
          const sortedMessages = data.messages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          setMessages(sortedMessages);
        })
        .catch((err) => {
          setError(`Error fetching messages: ${err.message}`);
          console.error(err);
        });
    } else {
      setError("No token found.");
    }
  }, [chatId, token]);

  // Send message handler
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);

    if (token) {
      fetch(`https://chat-appliacation.onrender.com/chatApp/v1/message/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage, chatId }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to send message");
          }
          return response.json();
        })
        .then((data) => {
          setMessages((prevMessages) => [...prevMessages, data]);
          setNewMessage("");
          socket.emit("newMessage", data);
        })
        .catch((err) => {
          setError(`Error sending message: ${err.message}`);
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    } else {
      setError("No token found.");
      setIsLoading(false);
    }
  };

  // Handle socket events for new messages and typing
  useEffect(() => {
    const handleNewMessage = (newMessageReceived) => {
      setMessages((prev) => [...prev, newMessageReceived]);
    };

    socket.on("messageReceived", handleNewMessage);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.off("messageReceived", handleNewMessage);
      socket.off("typing");
      socket.off("stopTyping");
    };
  });

  // Typing handler
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", chatId);
    }

    const lastTypingTime = Date.now();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = Date.now();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stopTyping", chatId);
        setTyping(false);
      }
    }, timerLength);
  };

  // const handleFocus = () => {
  //   setTyping(true); // User starts typing
  //   socket.emit("typing", chatId); // Notify others that the user is typing
  // };
  
  // const handleBlur = () => {
  //   setTyping(false); // User stops typing
  //   socket.emit("stop typing", chatId); // Notify others that the user stopped typing
  // };
  

  return (
    <div className="chat-section">
      <div className="chat-header">
        {chatDetails ? (
          <div className="chat-details">

            <button onClick={handleBackClick} className="back-button">
              &larr;
            </button> 
           <div className="details-section">
            <h2>{chatDetails.chatName !== 'sender'?chatDetails.chatName:''}</h2>
            {chatDetails.chatName !== 'sender'?(<p> Participants:{" "}
              {chatDetails.users.map((user) => user.name).join(", ")}</p>):
              (<h2>{chatDetails.users.map((user)=>user._id !==userId?user.name :'')}</h2>)}
             
           </div>
            {chatDetails.isGroupChat && (
              <GroupEdit
                chatDetails={chatDetails}
                setChatDetails={setChatDetails}
              />
            )}
          </div>
        ) : (
          <p>Loading chat details...</p>
        )}
      </div>

      <div className="messages-container">
        {error && <p className="error">{error}</p>}
        {messages.length === 0 ? (
          <p>No messages available</p>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`message ${
                  message.sender._id === userId ? "user-message" : "other-message"
                }`}
              >
                <img src={message.sender.pic} alt={message.sender.name} />
                <div>
                  {chatDetails.isGroupChat && <p>{message.sender.name}</p>}
                  <p>{message.content}</p>
                  <p className="timestamp">
                    <strong>Sent at:</strong>{" "}
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
                  <div className="message other-message" style={{position:'relative'}}>
                    <Lottie
                      options={defaultOptions}
                      style={{
                        position: "relative",
                        // bottom: "30px",
                        width: "40px",
                        height: "20px",
                        zIndex: 1500,
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

          </>
        )}
      </div>

      {/* <Lottie
              options={defaultOptions}
              style={{
                position: 'absolute',
                bottom: '30px',
                width: '40px',
                height: '20px',
                zIndex: '1500',
                objectFit: 'cover',
              }}
            /> */}

      <div className="input-container">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          // onFocus={handleFocus}
          // onBlur={handleBlur}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>

    </div>
  );
};

export default ChatSection;
