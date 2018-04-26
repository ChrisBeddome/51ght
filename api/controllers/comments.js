const Comment = require("../models/comment").model;
const Sighting = require("../models/sighting").model;
const mongoose = require("mongoose");
const extractUsername = require("../services/extract-username");

exports.addComment = (user, req, res, next) => {
  if (!req.body.content || req.body.content.length < 1) {
    return  res.status(500).json({error: "Must provide content"});
  }

  const sightingId = req.params.sightingId;

  const comment = new Comment({
    _id: new mongoose.Types.ObjectId(),
    userId: user.id,
    userName: extractUsername(user.email),
    content: req.body.content,
    date: new Date(),
  });

  Sighting.update({_id: sightingId}, {$push: {comments : comment}})
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Comment Added",
        comment: {
          userId: user.id,
          userName: extractUsername(user.email),
          content: req.body.content,
          date: new Date()
        }
      });
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
};

exports.updateComment = (user, req, res, next) => {
  if (!req.body.content || req.body.content.length < 1) {
    return  res.status(500).json({error: "Must provide content"});
  }
  const sightingId = req.params.sightingId;
  const commentId = req.params.commentId;
  Sighting.update({"comments._id" : commentId}, {$set: {"comments.$.content" : req.body.content}})
    .exec()
    .then(result => {
      res.status(200).json({message: "Comment Edited"});
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
};

exports.deleteComment = (user, req, res, next) => {
  const sightingId = req.params.sightingId;
  const commentId = req.params.commentId;

  Sighting.update({_id: sightingId}, {$pull: {comments : {_id : commentId}}})
    .exec()
    .then(result => {
      res.status(200).json({message: "Comment Deleted"});
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
};