import React, { useState } from "react";
import io from "socket.io-client";
import JoinRoom from "./components/JoinRoom";
import Chat from "./components/Chat";

const socket = io.connect(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
);

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    } else {
      alert("Please enter both Name and Room ID");
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <JoinRoom 
          setUsername={setUsername} 
          setRoom={setRoom} 
          username={username}
          room={room}
          joinRoom={joinRoom} 
        />
      ) : (
        <Chat socket={socket} username={username} room={room} setJoined={setShowChat} />
      )}
    </div>
  );
}

export default App;
