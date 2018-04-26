const Sighting = require("../models/sighting").model;

exports.sightingAuthor = (user, req, res, next) => {
  const sightingId = req.params.sightingId;

  Sighting.findById(sightingId)
    .select("userId")
    .exec()
    .then(doc => {
      if (doc.userId === user.id) {
        next(user);
      } else {
        res.status(403).json({message: "Unauthorized"});
      } 
    })
    .catch(err => {
      res.status(500).json({error: "Server Error"});
    });
};

exports.commentAuthor = (user, req, res, next) => {
  const commentId = req.params.commentId;

  Sighting.findOne({"comments._id" : commentId})
    .select("comments")
    .exec()
    .then(doc => {
      let comment = doc.comments.filter(comment => comment._id == commentId)[0];
      if (comment.userId == user.id) {
        next(user);
      } else {
        res.status(403).json({message: "Unauthorized"});
      } 
    })
    .catch(err => {
      res.status(500).json({error: "Server Error"});
    });
};