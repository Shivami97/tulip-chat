import React from 'react';
import { LogIn, Hash, User } from 'lucide-react';

function JoinRoom({ setUsername, setRoom, username, room, joinRoom }) {
  return (
    <div className="join-container fade-in">
      <div className="join-card">
        <div className="logo-section">
          <div className="tulip-logo-emoji">🌷</div>
        </div>
        
        <div className="form-section">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="Your Name..." 
              value={username}
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <Hash className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="Room ID (e.g. Friends)" 
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              onKeyDown={(event) => event.key === "Enter" && joinRoom()}
            />
          </div>

          <button className="join-btn" onClick={joinRoom}>
            <span>Join Room</span>
            <LogIn size={20} />
          </button>
        </div>

        <div className="footer-links">
          <p>Secure. Fast. Beautiful.</p>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;
