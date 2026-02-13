const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
      content: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      time: Date,
      type: { type: String, default: "text" }, // text, image, file
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    isGroup: { type: Boolean, default: false },
    groupName: String,
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
