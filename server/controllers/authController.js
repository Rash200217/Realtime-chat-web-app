const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!email) {
       return res.status(400).json({ error: "Email is required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Auto-assign admin role if email contains 'admin'
    const role = email.toLowerCase().includes("admin") ? "admin" : "user";
    
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || "user" }, // Fallback to "user"
      process.env.JWT_SECRET,
    );
    
    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role || "user" },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
