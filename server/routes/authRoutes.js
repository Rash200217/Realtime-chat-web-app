const router = require("express").Router();
const { register, login } = require("../controllers/authController");

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

module.exports = router;
