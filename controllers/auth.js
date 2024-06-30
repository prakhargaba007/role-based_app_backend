const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email.toLowerCase();
    const name = req.body.name;
    const password = req.body.password;
    const role = req.body.role;
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      name,
      password: hashedPw,
      role,
    });
    const result = await user.save();
    res.status(201).json({
      message: "User created!",
      userId: result._id,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Email and password is incorrect");
      error.statusCode = 403;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect");
      error.statusCode = 403;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "somesupersecretkey"
      // { expiresIn: "1h" }
    );
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("Could not find user");
      error.statusCode = 404;
      throw error;
    }

    user.name = req.body.name;

    const result = await user.save();

    res.status(201).json({
      message: "User updated!",
      userId: result._id,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateUserPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("Could not find user");
      error.statusCode = 404;
      throw error;
    }
    const newPassword = req.body.password;
    user.password = await bcrypt.hash(newPassword, 12);

    const result = await user.save();

    res.status(201).json({
      message: "User password updated!",
      userId: result._id,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getUser = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    console.log(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
