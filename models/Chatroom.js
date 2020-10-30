const mongoose = require("mongoose");

const chatroomSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  messages: [],
});

module.exports = mongoose.model("Chatroom", chatroomSchema);
