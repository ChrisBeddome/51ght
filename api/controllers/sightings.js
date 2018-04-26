const Sighting = require("../models/sighting").model;
const mongoose = require("mongoose");
const extractUsername = require("../services/extract-username");

exports.getAllSightings = async (req, res, next) => {
  try {
    const docs = await Sighting.find()
      .select("_id title description position date imageURL userId userName")
      .sort({date: 'desc'})
      .exec();
    const response = {
      count: docs.length,
      sightings: docs
    };  
    if (docs.length > 0) {
      res.status(200).json(response);
    } else {
      res.status(200).json({message: "No entries found"});
    } 
  } catch(err) {
    res.status(500).json({
      error: err.message
    });
  }
};

exports.addNewSighting = (user, req, res, next) => {
  const sighting = new Sighting({
    _id: new mongoose.Types.ObjectId(),
    userId: user.id,
    userName : extractUsername(user.email),
    title: req.body.title,
    description: req.body.description,
    date: new Date(),
    position: req.body.position,
    comments: [],
  });
  sighting.save()
    .then(result => {
    res.status(201).json({
      message: "Sighting added",
      sighting: {
        _id: result._id,
        title: result.title,
        description: result.description,
        date: result.date,
        position: result.position,
        userName: result.userName,
        userId: result.userId
      }
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
};

exports.getSingleSighting = (req, res, next) => {
  const id = req.params.sightingId;
  Sighting.findById(id)
    .select("_id title description position date imageURL comments userId userName")
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({message: "Not found"});
      } 
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
};

exports.updateSighting = (user, req, res, next) => {
  const id = req.params.sightingId;
  const updateOps = {};
  const patchableParams = ["title", "description", "position"]; 
  const params = req.body.params.filter(param => patchableParams.indexOf(param.propName) !== -1);
  for (let ops of params) {
    updateOps[ops.propName] = ops.value;
  }
  Sighting.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
      res.status(200).json({message: "Sighting updated"});
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
};

exports.deleteSighting = (user, req, res, next) => {
  const id = req.params.sightingId;
  Sighting.remove({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({message: "Sighting deleted"})
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
};


