import React, { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft, LogOut } from "lucide-react";

function Chat({ socket, username, room, setJoined }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const scrollRef = useRef(null);
  const typingTimeout = useRef(null);

  // Handle typing
  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);

    // Start typing
    if (!typing) {
      setTyping(true);

      socket.emit("typing", {
        room,
        author: username,
      });
    }

    // Clear old timeout
    clearTimeout(typingTimeout.current);

    // Stop typing after 1 sec
    typingTimeout.current = setTimeout(() => {
      setTyping(false);

      socket.emit("stop_typing", {
        room,
        author: username,
      });
    }, 1000);
  };

  // Send message
  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        room,
        author: username,
        message: currentMessage,
        time:
          new Date().getHours() +
          ":" +
          new Date().getMinutes().toString().padStart(2, "0"),
      };

      await socket.emit("send_message", messageData);

      // Stop typing when sent
      socket.emit("stop_typing", {
        room,
        author: username,
      });

      setTyping(false);
      setTypingUser("");

      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  // Socket listeners
  useEffect(() => {
    // Receive messages
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Someone typing
    socket.on("user_typing", (data) => {
      if (data.author !== username) {
        setTypingUser(`${data.author} is typing...`);
      }
    });

    // Stop typing
    socket.on("user_stop_typing", () => {
      setTypingUser("");
    });

    // Cleanup
    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket, username]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <div className="chat-window fade-in">
      {/* HEADER */}
      <div className="chat-header">
        <div className="header-info">
          <button
            className="back-btn"
            onClick={() => setJoined(false)}
          >
            <ArrowLeft size={20} />
          </button>

          <div className="avatar-small">
            <span>🌷</span>
          </div>

          <div className="room-details">
            <h2>{room}</h2>
            <p>Live Chatting</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            title="Leave Room"
            onClick={() => window.location.reload()}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="chat-body">
        {messageList.map((msg, index) => (
          <div
            className="message"
            key={index}
            id={username === msg.author ? "you" : "other"}
          >
            <div className="message-content">
              <p>{msg.message}</p>
            </div>

            <div className="message-meta">
              <span>{msg.time}</span>
              <span className="author">{msg.author}</span>
            </div>
          </div>
        ))}

        <div ref={scrollRef} />

        {/* Typing Indicator */}
        {typingUser && (
          <div className="typing-indicator">
            {typingUser}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          autoFocus
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default Chat;
