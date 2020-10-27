const express = require("express");
const errorHandlers = require("./handlers/errorhandlers");
const mongoose = require("mongoose");
const config = require("./config/key");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const userRoutes = require("./routes/user");
const chatroomRoutes = require("./routes/chatroom");

const app = express();

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("db connected"))
  .catch((err) => console.error(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Set-Cookie,Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", true);
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/users", userRoutes);
app.use("/chatrooms", chatroomRoutes);
//setup error handlers
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
app.use(errorHandlers.mongoseErrors);
if (process.env.NODE_ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}

module.exports = app;
