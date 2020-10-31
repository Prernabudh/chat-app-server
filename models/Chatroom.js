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
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  userAjoin: {
    type: String,
  },
  userBjoin: {
    type: String,
  },
  userAleave: {
    type: String,
  },
  userBleave: {
    type: String,
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
});

module.exports = mongoose.model("Chatroom", chatroomSchema);
