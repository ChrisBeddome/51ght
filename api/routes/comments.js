const express = require("express");
const router = express.Router({mergeParams: true});
const commentsController = require("../controllers/comments");
const authorize = require("../middleware/authorize");
const authenticate = require("../middleware/authenticate");

router.post("/", authenticate, commentsController.addComment);
router.patch("/:commentId", authenticate, authorize.commentAuthor, commentsController.updateComment);
router.delete("/:commentId", authenticate, authorize.commentAuthor, commentsController.deleteComment);

module.exports = router;