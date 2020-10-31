const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    required: "Chatroom is required!",
    ref: "Chatroom",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: "Chatroom is required!",
    ref: "User",
  },
  message: {
    type: String,
    required: "Message is required!",
  },
  time: {
    type: String,
  },
  date: {
    type: String,
  },
  username: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
});

module.exports = mongoose.model("Message", messageSchema);
