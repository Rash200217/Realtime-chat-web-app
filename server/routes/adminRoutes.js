const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const adminMiddleware = require("../middleware/adminMiddleware");

// Protect all admin routes
router.use(adminMiddleware);

// 1. Get System Stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const activeChats = await Chat.countDocuments();
    
    // Calculate simple growth (users created in last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newUsers = await User.countDocuments({ createdAt: { $gte: lastWeek } });
    
    res.json({
      totalUsers,
      totalMessages,
      activeChats,
      newUsers
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 2. Get All Users (with Search & Pagination)
router.get("/users", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Ban/Unban User
router.put("/users/:id/ban", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.role === "admin") {
      return res.status(400).json({ error: "Cannot ban an admin" });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ message: `User ${user.isBanned ? "banned" : "unbanned"} successfully`, user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 4. Get Recent Chats
router.get("/chats", async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("participants", "username email")
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 5. Delete Chat
router.delete("/chats/:id", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ room: req.params.id }); // Clean up messages
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
