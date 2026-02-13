const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes"); // Create this file linking to controller
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => res.send("API Running"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use(express.json());

// Health Check
app.get("/", (req, res) => res.send("API Running"));


app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// Socket Logic
// Store online users: Map<UserId, SocketId>
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("user_connected", async (userId) => {
    onlineUsers.set(userId, socket.id);
    // Broadcast status to everyone
    io.emit("user_status", { userId, status: "online" });
    
    // Update DB
    const User = require("./models/User");
    await User.findByIdAndUpdate(userId, { isOnline: true });
  });
  
  socket.on("join_room", (room) => {
    socket.join(room);
  });
  
  socket.on("typing", (data) => {
    socket.to(data.room).emit("display_typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("hide_typing", data);
  });

  socket.on("send_message", async (data) => {
    // Save to DB
    const Message = require("./models/Message");
    const newMessage = new Message({
      sender: data.senderId,
      content: data.content,
      room: data.room,
      type: data.type,
      fileName: data.fileName
    });
    const savedMsg = await newMessage.save();

    // Update Chat Model (lastMessage)
    const Chat = require("./models/Chat");
    // Assuming 'room' is the Chat ID
    await Chat.findByIdAndUpdate(data.room, {
      lastMessage: {
        content: data.content,
        sender: data.senderId,
        time: new Date(),
        type: data.type
      }
    });

    // Broadcast to others only
    const msgData = { ...data, _id: savedMsg._id }; // Send back DB ID
    socket.to(data.room).emit("receive_message", msgData);
  });
 
  socket.on("disconnect", async () => {
    console.log("User Disconnected", socket.id);
    // Find user by socket id
    let userId = null;
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        userId = uid;
        break;
      }
    }
    
    if (userId) {
      onlineUsers.delete(userId);
      io.emit("user_status", { userId, status: "offline" });
       const User = require("./models/User");
       await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    }
  });


});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
