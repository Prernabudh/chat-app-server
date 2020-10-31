const express = require("express");
const router = express.Router();
const { catchErrors } = require("../handlers/errorhandlers");
const userController = require("../controllers/user");

router.post("/login", userController.login);
router.post("/register", userController.register);
router.post("/getUser", userController.getUser);
router.post("/findByUsername", userController.findByUsername);

module.exports = router;
