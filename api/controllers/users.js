const Sighting = require("../models/sighting").model;
const mongoose = require("mongoose");

exports.getSightings = (req, res, next) => {
  Sighting.find({userId : req.params.userId})
    .select("_id title description position date imageURL userName userId")
    .sort({date: 'desc'})
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        sightings: docs
      };
      if (docs.length > 0) {
        res.status(200).json(response);
      } else {
        res.status(200).json({message: "No entries found"});
      } 
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};