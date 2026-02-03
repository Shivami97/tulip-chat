import React, { useState } from "react";
import io from "socket.io-client";
import JoinRoom from "./components/JoinRoom";
import Chat from "./components/Chat";

const backendUrl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:4000`;
console.log("Connecting to backend at:", backendUrl);
const socket = io.connect(backendUrl);

socket.on("connect", () => {
  console.log("Successfully connected to socket server!");
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      console.log(`User ${username} joining room ${room}`);
      socket.emit("join_room", room);
      setShowChat(true);
    } else {
      alert("Please enter both Name and Room ID");
      console.warn("Attempted to join room without username or room ID.");
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
