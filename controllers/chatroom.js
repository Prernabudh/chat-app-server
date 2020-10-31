const mongoose = require("mongoose");
const Chatroom = require("../models/Chatroom");
const User = require("../models/User");

exports.createChatroom = async (req, res) => {
  const userA = req.body.userA;
  const userB = req.body.userB;
  Chatroom.findOne({
    $or: [
      { $and: [{ userA: userA }, { userB: userB }] },
      { $and: [{ userA: userB }, { userB: userA }] },
    ],
  })
    .then((user) => {
      console.log(user);
      if (user) {
        res.status(200).json(user);
      } else {
        const chatroom = new Chatroom({
          _id: mongoose.Types.ObjectId(),
          userA: userA,
          userB: userB,
        });
        chatroom
          .save()
          .then((data) => {
            res.status(200).json(data);
            User.findByIdAndUpdate(userA, { $push: { chatrooms: data._id } })
              .then((resp) => {
                res.status(200).json(resp);
              })
              .catch((err) => {
                res.status(500).json(err);
              });
            User.findByIdAndUpdate(userB, { $push: { chatrooms: data._id } })
              .then((resp) => {
                res.status(200).json(resp);
              })
              .catch((err) => {
                res.status(500).json(err);
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              errors: err,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.getAllChatrooms = (req, res) => {
  const userId = req.body.id;
  Chatroom.find({ $or: [{ userA: userId }, { userB: userId }] })
    .populate("userA")
    .populate("userB")
    .populate("lastMessage")
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.sendMessage = (req, res) => {
  const chatroomId = req.body.chatroomId;
  const userId = req.body.userId;
  const message = req.body.message;
  const chatId = mongoose.Types.ObjectId(chatroomId);
  const today = new Date();
  const newMessage = {
    user: userId,
    message: message,
    time: today.getHours() + ":" + today.getMinutes(),
  };
  Chatroom.findById(chatId)
    .then((chatroom) => {
      const key = (
        today.getDate() +
        "-" +
        today.getMonth() +
        "-" +
        today.getFullYear()
      ).toString();
      console.log("chatroom message!!!!!!!!");
      let tempArr = [];
      if (!chatroom.messages.has(key)) {
        tempArr = [...tempArr, newMessage];
        chatroom.set(key, tempArr);
      } else {
        tempArr = chatroom.get(key);
        tempArr = [...tempArr, newMessage];
        chatroom.set(key, tempArr);
      }
      console.log("chatroom===============>" + chatroom);
      chatroom
        .save()
        .then((data) => {
          res.status(200).json(data);
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

exports.getMessagesInslots = (req, res) => {
  const { chatroomId } = req.body;
  const { from, to } = req.body;
  Chatroom.findById(chatroomId)
    .populate("messages")
    .populate("userA")
    .populate("userB")
    .then((data) => {
      res.status(200).json({
        userA: data.userA,
        userB: data.userB,
        messages: data.messages.splice(from, to),
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

exports.getMessages = (req, res) => {
  const { chatroomId } = req.body;
  Chatroom.findById(chatroomId)
    .populate("messages")
    .populate("userA")
    .populate("userB")
    .then((data) => {
      res.status(200).json({
        userA: data.userA,
        userB: data.userB,
        end: data.messages.length - 20 < 0 ? 0 : data.messages.length - 20,
        messages: data.messages.splice(
          data.messages.length - 20 < 0 ? 0 : data.messages.length - 20,
          data.messages.length
        ),
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
