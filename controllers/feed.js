const mongoose = require("mongoose");
const Post = require("../models/post");
const User = require("../models/user");

exports.note = async (req, res, next) => {
  await Post.find();
  res.status(200).json({
    message: "Notes retrieved",
  });
};

exports.postNote = async (req, res, next) => {
  try {
    // const userId = "6666e8d001974bdb3ee61343";
    const userId = req.userId;
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;
    // console.log({
    //   title,
    //   description,
    //   date,
    // });

    const post = new Post({
      title,
      description,
      date,
      author: userId, // Ensure author field is set
    });

    await post.save();

    const user = await User.findById(userId);

    // Check if user was found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.posts.push(post);

    await user.save();

    res.status(201).json({
      message: "Note Created",
      post: post,
      creator: {
        _id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const userId = req.userId;
    // console.log(userId);
    // let userId = "6666e8d001974bdb3ee61343";

    const notes = await Post.find({ author: userId });
    // console.log(notes);

    res.status(200).json({
      message: "Notes retrieved",
      notes: notes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;

    const note = await Post.findById(noteId);

    res.status(200).json({
      message: "Note retrieved",
      note: note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.editNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;

    const note = await Post.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.title = title || note.title;
    note.description = description || note.description;
    note.date = date || note.date;

    await note.save();

    res.status(200).json({
      message: "Note Updated",
      note: note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.userId;
    // const userId = "6666e8d001974bdb3ee61343";

    const note = await Post.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // console.log("1 ", note.author.toString());
    // console.log("2 ", userId);

    if (note.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this note" });
    }

    await Post.findByIdAndDelete(noteId);

    const user = await User.findById(userId);

    if (user) {
      user.posts.pull(noteId);
      await user.save();
    }

    res.status(200).json({
      message: "Note Deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
