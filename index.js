const http = require("http");
const app = require("./app");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3001;
const Message = require("./models/Chatroom");
const User = require("./models/User");
const mongoose = require("mongoose");

const server = http.createServer(app);
const serve = server.listen(port);

const io = require("socket.io")(serve);

io.use(async (socket, next)=>{
    try{
        const token = socket.handshake.query.token;
        socket.userId = token;
        next();
    }catch(err){}
})

io.on("connection", (socket)=>{
    console.log("Connected: "+ socket.userId);

    socket.on("disconnect", ()=>{
        console.log("Disconnected: "+socket.userId);
    })

    socket.on("joinRoom", ({chatroomId})=>{
        socket.join(chatroomId);
        console.log("A user joined chatroom: "+ chatroomId);
    })

    socket.on("leaveRoom", ({chatroomId})=>{
        socket.leave(chatroomId);
        console.log("A user left chatroom: "+ chatroomId)
    });

    socket.on("chatroomMessage",async  ({chatroomId, message})=>{
        
            const user = await User.findOne({_id:socket.userId});
            const newMessage = new Message({chatroom: chatroomId, user: socket.userId, message:message})
            const today = new Date();
            io.to(chatroomId).emit("newMessage", {
                message: message,
                userId: socket.userId,
                name: user.name,
                time: today.getHours()+":"+today.getMinutes()
            })

            await newMessage.save();
    })
    socket.on("typing", async({userId, chatroomId})=>{
        const user = await User.findOne({_id:socket.userId});
        io.to(chatroomId).emit("typing", {
            userId: userId,
            name: user.name
        })
    })
})