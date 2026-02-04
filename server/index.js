const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health route (for UptimeRobot)
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Create server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // Later you can restrict to your Vercel domain
    methods: ["GET", "POST"],
  },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // Send message
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  // User typing
  socket.on("typing", (data) => {
    socket.to(data.room).emit("user_typing", data);
  });

  // User stopped typing
  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("user_stop_typing", data);
  });

  // Message seen (✔✔)
  socket.on("message_seen", (data) => {
    socket.to(data.room).emit("message_seen_update", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
