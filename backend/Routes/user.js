const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../middlewares/nodemailer");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();


//////////////////////////////////// SIGN UP /////////////////////////////////////////////////////

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });

    User.findOne({ email: req.body.email }).then((user1) => {
      if (user1) {
        return res.status(401).json({
          message: "User Already Exists",
        });
      }

      user
        .save()
        .then(async (result) => {
          if (!result) {
            return res.status(500).json({
              message: "Error Creating User",
            });
          }
          const message = `Here are your credentials:\nEmail: ${req.body.email}\nPassword: ${req.body.password}`;

          await sendEmail({
            email: user.email,
            subject: "Thank you for signing up!",
            message,
          });

          res.status(201).json({
            message: "User created!",
            result: result,
          });
        })
        .catch((err) => {
          res.status(500).json({
            error: err,
          });
        });
    });
  });
});

///////////////////////////////////////LOGIN /////////////////////////////////////////////////////

router.post("/login", (req, res, next) => {
  let fetchedUser;

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed no such user",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed incorrect password",
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
      });
    })
    .catch((e) => {
      console.log(e);
    });
});

////////////////////////////////////////////////// FORGOT PASSOWRD/////////////////////////////////////////////////

// generates a random token for forgot password functionality
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
// hashes the same token for reset password functionality
const hashToken = (token) => {
  const sha256 = crypto.createHash("sha256");
  sha256.update(token);
  return sha256.digest("hex");
};


router.post("/forgotPassword", async (req, res, next) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = generateToken();
    const tokenDB = hashToken(resetToken);

    user.passwordResetToken = tokenDB;
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/user/resetPassword/${resetToken}`;

    const message = `Hey ${user.name}, \n Forgot your password? Don't Worry :) \n Submit a PATCH request with your new password to: ${resetURL} \n If you didn't forget your password, please ignore this email ! `;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token is only valid for 10 mins!",
      message,
    });

    res.status(200).json({
      message: "Forgot Password Token sent to email!",
      token: resetToken,
    });

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    await delay(600000); // Wait for 10 mins
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    console.log("Password reset token deleted successfully");
  } catch (err) {
    console.log(err);
  }
});

///////////////////////////////////////////////RESET PASSWORD //////////////////////////////////////////////////

router.patch("/resetPassword/:token", async (req, res, next) => {
  try {
    const { password } = req.body;
    const token = req.params.token;
    const hashedToken = hashToken(token);

    const user = await User.findOne({ passwordResetToken: hashedToken });

    if (!user) {
      return res.status(404).json({
        message: "Invalid or expired token",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    await user.save();

    res.status(200).json({
      msg: "Password successfully changed",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
