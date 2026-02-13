const mongoose = require("mongoose");
const http = require("http");
const User = require("./models/User");
const Message = require("./models/Message");
const Chat = require("./models/Chat");
require("dotenv").config();

async function checkStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB via mongoose");
    
    const userCount = await User.countDocuments();
    const messageCount = await Message.countDocuments();
    const chatCount = await Chat.countDocuments();
    
    console.log("--- DIRECT DB COUNTS ---");
    console.log(`Users: ${userCount}`);
    console.log(`Messages: ${messageCount}`);
    console.log(`Chats: ${chatCount}`);

    const users = await User.find({}, "username email role");
    console.log("\n--- USER LIST ---");
    users.forEach(u => {
      console.log(`User: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
    });
    
    // Now verify the API endpoint
    // We need an admin token. I'll create a temp admin user or login as one.
    // For simplicity, let's just make the request without auth first to see if it's protected (it IS protected)
    // So I need to register/login an admin first.
    
    // Actually, I can just test the logic directly here since I have access to the DB. 
    // If the DB counts are > 0, but the frontend shows 0, then the API might be failing or the frontend is not fetching correctly.
    // If DB counts are 0, then the "bug" is just that there's no data.
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkStats();
