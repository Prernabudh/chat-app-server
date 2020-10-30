const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const chatroomController = require("../controllers/chatroom");

const auth = require("../middleware/auth");

router.post("/createChatroom", auth, chatroomController.createChatroom);
router.post("/getChatrooms", auth, chatroomController.getAllChatrooms);
router.post("/sendMessage", chatroomController.sendMessage);
router.post("/getMessages", chatroomController.getMessages);

module.exports = router;
