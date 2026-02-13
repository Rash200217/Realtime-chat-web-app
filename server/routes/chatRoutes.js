const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

// Get all chats for a user
router.get("/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.params.userId] },
    })
      .populate("participants", "-password")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create or Get status of 1-on-1 Chat
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [senderId, receiverId] },
    });

    if (chat) {
      chat = await chat.populate("participants", "-password");
      return res.json(chat);
    }

    // Create new chat
    const newChat = new Chat({
      participants: [senderId, receiverId],
      lastMessage: {
        content: "Draft",
        time: new Date(),
      },
      unreadCounts: {
        [senderId]: 0,
        [receiverId]: 0,
      }
    });

    await newChat.save();
    chat = await newChat.populate("participants", "-password");
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get messages for a specific chat (Moved/Updated from old chatRoutes)
router.get("/messages/:roomId", async (req, res) => {
  try {
      // Assuming 'room' in Message model corresponds to Chat ID or a unique room string
      // If we are migrating to Chat ID based rooms:
      const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
      res.json(messages);
  } catch (err) {
      res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
