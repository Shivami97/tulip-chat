const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();

// Allow connections from local and production frontend
const origin = process.env.FRONTEND_URL || "http://localhost:5173";

app.get("/", (req, res) => {
  res.send("Server is running... Tulip Chat Backend is Live!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


app.use(cors({
  origin: true, // Allow all origins for easier local network access
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for Socket.IO
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", (data) => {
    console.log(`Message from ${data.author} in room ${data.room}: ${data.message}`);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
