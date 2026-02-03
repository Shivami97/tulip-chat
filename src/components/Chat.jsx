import React, { useEffect, useState, useRef } from 'react';
import { Send, Hash, Users, ArrowLeft, LogOut } from 'lucide-react';

function Chat({ socket, username, room, setJoined }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const scrollRef = useRef();

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + Math.floor(new Date(Date.now()).getMinutes()).toString().padStart(2, '0'),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    return () => socket.off("receive_message");
  }, [socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <div className="chat-window fade-in">
      <div className="chat-header">
        <div className="header-info">
          <button className="back-btn" onClick={() => setJoined(false)}>
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
           <button title="Leave Room" onClick={() => window.location.reload()}>
              <LogOut size={20} />
           </button>
        </div>
      </div>
      
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
      </div>

      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          autoFocus
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default Chat;
