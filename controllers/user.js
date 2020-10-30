const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  const { name, email, password, username } = req.body;
  User.findOne({ username: username }).then((user) => {
    if (user)
      res.status(500).json({
        message: "Username already exists!",
      });
    else {
      bcrypt.hash(req.body.password, 8, async (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err,
          });
        } else {
          const user = new User({
            _id: mongoose.Types.ObjectId(),
            name: name,
            email: email,
            password: hash,
            username: username,
          });
          user
            .save()
            .then((data) => {
              res
                .status(200)
                .json({ data: data, message: "Registration successful!" });
            })
            .catch((err) => {
              res.status(500).json({
                err: err,
              });
            });
        }
      });
    }
  });
};

exports.login = (req, res, next) => {
  User.find({ email: req.body.email })
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed!",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
            },
            process.env.JWT_KEY || "key"
          );
          res.cookie("jwt", token, {
            httpOnly: true,
          });
          if (user[0].email !== "Removed") {
            return res.json({
              _id: user[0]._id,
              name: user[0].name,
              email: user[0].email,
              message: "Success!",
            });
          }
        }
        return res.status(401).json({
          message: "Auth failed!",
        });
      });
    })
    .catch((e) => {
      console.log(e);
      res.status(500).json({
        error: "something went wrong!",
      });
    });
};
