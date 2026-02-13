const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config({ path: "../.env" });

const promoteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = process.argv[2];
    if (!email) {
      console.log("Please provide an email: node promote_admin.js <email>");
      process.exit(1);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found!");
      process.exit(1);
    }

    user.role = "admin";
    await user.save();
    console.log(`Success! User ${user.username} (${user.email}) is now an Admin.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

promoteUser();
