const http = require("http");
const app = require("./app");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3001;
const Message = require("./models/Message");
const User = require("./models/User");
const mongoose = require("mongoose");
const Chatroom = require("./models/Chatroom");

const server = http.createServer(app);
const serve = server.listen(port);

const io = require("socket.io")(serve);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    socket.userId = token;
    next();
  } catch (err) {}
});

io.on("connection", (socket) => {
  socket.on("userOnline", async () => {
    console.log("A user connected " + socket.userId);
    const newUser = await User.findOne({ _id: socket.userId });
    newUser.chatrooms.forEach((chatroom) => {
      io.to(chatroom).emit("userOnline", {
        userId: socket.userId,
      });
    });
    const updateUser2 = await User.findByIdAndUpdate(socket.userId, {
      lastscene: "Online",
    });
  });
  socket.on("disconnect", async () => {
    console.log("A user disconnected " + socket.userId);
    const disconnectedUser = await User.findOne({ _id: socket.userId });
    const now = new Date();
    disconnectedUser.chatrooms.forEach((chatroom) => {
      io.to(chatroom).emit("userOffline", {
        userId: socket.userId,
        time: now.toString(),
      });
    });
    const updateUser = await User.findByIdAndUpdate(socket.userId, {
      lastscene: now.toString(),
    });
  });

  socket.on("joinRoom", ({ chatroomId }) => {
    const nowTime = new Date();
    socket.join(chatroomId);
    console.log("A user joined chatroom: " + chatroomId);
    Chatroom.findById(chatroomId).then((response) => {
      if (response) {
        if (response.userA == socket.userId) {
          response.userAjoin = nowTime;
          response.userAleave = nowTime;
        } else {
          response.userBjoin = nowTime;
          response.userBleave = nowTime;
        }
        response
          .save()
          .then((resp) => {})
          .catch((err) => {});
      }
    });
  });

  socket.on("leaveRoom", ({ chatroomId }) => {
    const nowTime = new Date();
    socket.leave(chatroomId);
    console.log("A user left chatroom: " + chatroomId);
    Chatroom.findById(chatroomId).then((response) => {
      if (response) {
        if (response.userA == socket.userId) {
          response.userAleave = nowTime;
        } else {
          response.userBleave = nowTime;
        }
        response
          .save()
          .then((resp) => {})
          .catch((err) => {});
      }
    });
  });

  socket.on("chatroomMessage", async ({ chatroomId, message }) => {
    const user = await User.findOne({ _id: socket.userId });
    const today = new Date();
    io.to(chatroomId).emit("newMessage", {
      message: message,
      userId: socket.userId,
      name: user.name,
      username: user.username,
      time:
        (today.getHours() < 10 ? "0" + today.getHours() : today.getHours()) +
        ":" +
        (today.getMinutes() < 10
          ? "0" + today.getMinutes()
          : today.getMinutes()),
      date: (
        (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) +
        "-" +
        (today.getMonth() < 10 ? "0" + today.getMonth() : today.getMonth()) +
        "-" +
        today.getFullYear()
      ).toString(),
    });

    const chatId = mongoose.Types.ObjectId(chatroomId);
    const newMessage = new Message({
      _id: mongoose.Types.ObjectId(),
      chatroom: chatId,
      userId: socket.userId,
      message: message,
      time:
        (today.getHours() < 10 ? "0" + today.getHours() : today.getHours()) +
        ":" +
        (today.getMinutes() < 10
          ? "0" + today.getMinutes()
          : today.getMinutes()),
      date: (
        (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) +
        "-" +
        (today.getMonth() < 10 ? "0" + today.getMonth() : today.getMonth()) +
        "-" +
        today.getFullYear()
      ).toString(),
      username: user.username,
      timestamp: today,
    });
    const data = await newMessage.save();
    console.log(data);
    const chatroomFound = await Chatroom.findByIdAndUpdate(chatId, {
      $push: { messages: data._id },
      lastMessage: data._id,
    });
    console.log(chatroomFound);
    const arr = [chatroomFound.userA, chatroomFound.userB];
    arr.forEach((e) => {
      io.to(e).emit("reloadDashboard", {
        message: message,
        userId: socket.userId,
        name: user.name,
        username: user.username,
        time:
          (today.getHours() < 10 ? "0" + today.getHours() : today.getHours()) +
          ":" +
          (today.getMinutes() < 10
            ? "0" + today.getMinutes()
            : today.getMinutes()),
        date: (
          (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) +
          "-" +
          (today.getMonth() < 10 ? "0" + today.getMonth() : today.getMonth()) +
          "-" +
          today.getFullYear()
        ).toString(),
      });
    });
  });
  socket.on("typing", async ({ userId, chatroomId }) => {
    const user = await User.findOne({ _id: socket.userId });
    io.to(chatroomId).emit("typing", {
      userId: userId,
      name: user.name,
    });
  });
});
