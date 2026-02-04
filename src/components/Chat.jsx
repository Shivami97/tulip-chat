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

    if (!typing) {
      setTyping(true);

      socket.emit("typing", {
        room,
        author: username,
      });
    }

    clearTimeout(typingTimeout.current);

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
        seen: false, // 👈 For double tick
      };

      await socket.emit("send_message", messageData);

      // Stop typing
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

    // Message seen update
    socket.on("message_seen_update", (data) => {
      setMessageList((list) =>
        list.map((msg) =>
          msg.time === data.time && msg.author === username
            ? { ...msg, seen: true }
            : msg
        )
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("message_seen_update");
    };
  }, [socket, username]);

  // Auto scroll + mark seen
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });

    if (messageList.length > 0) {
      const lastMsg = messageList[messageList.length - 1];

      // If other user's message → mark as seen
      if (lastMsg.author !== username && !lastMsg.seen) {
        socket.emit("message_seen", {
          room,
          time: lastMsg.time,
        });
      }
    }
  }, [messageList, socket, username]);

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

              {/* Seen Tick */}
              {username === msg.author && (
                <span className="seen-status">
                  {msg.seen ? "✔✔" : "✔"}
                </span>
              )}

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
