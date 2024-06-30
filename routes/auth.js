const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authCntroller = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty")
      .isLength({ min: 6 })
      .withMessage("Password must be at least  6 characters long"),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ min: 3 }),
  ],
  authCntroller.signup
);

router.post("/login", authCntroller.login);

router.post("/profile", isAuth, authCntroller.getUser);

router.put(
  "/updateUser",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ min: 3 }),
    body("gender").notEmpty(),
  ],
  authCntroller.updateUserProfile
);

router.put(
  "/changePassword",
  [
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty")
      .isLength({ min: 6 })
      .withMessage("Password must be at least  6 characters long"),
  ],
  authCntroller.updateUserPassword
);

module.exports = router;
