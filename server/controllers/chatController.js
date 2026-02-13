const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).populate(
      "sender",
      "username",
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
