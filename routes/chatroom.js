const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const chatroomController = require("../controllers/chatroom");

const auth = require("../middleware/auth");

router.post(
  "/createChatroom",
  auth,
  catchErrors(chatroomController.createChatroom)
);

module.exports = router;
