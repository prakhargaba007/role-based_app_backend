const express = require("express");

const feedCntroller = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", feedCntroller.note);

router.post("/note", isAuth, feedCntroller.postNote);

router.get("/notes", isAuth, feedCntroller.getNotes);

router.get("/note/:noteId", isAuth, feedCntroller.getNote);

router.put("/note/:noteId", isAuth, feedCntroller.editNote); // Endpoint to edit a note

router.delete("/note/:noteId", isAuth, feedCntroller.deleteNote); // Endpoint to delete a note

module.exports = router;
