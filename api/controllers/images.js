const Sighting = require("../models/sighting").model;
const multer = require("multer");

//configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "data/images/");
  }, 
  filename: function(req, file, cb) {
    console.log(file);
    cb(null, new Date().getTime() + Math.floor(Math.random() * 999999909999999).toString() + "." + file.mimetype.split("/")[1]);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

exports.uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

exports.extractParams = multer();

exports.addImage = (user, req, res, next) => {
  const id = req.params.sightingId;
  const filepath = `images/${req.file.filename}`;

  Sighting.update({_id: id}, {$set: {imageURL: filepath}})
    .exec()
    .then(result => {
      res.status(200).json({message: "Image Added!"});
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
};

exports.deleteImage = (user, req, res, next) => {
  const sightingId = req.params.sightingId;

  Sighting.update({_id: sightingId}, {$unset: {imageURL: 1}})
    .exec()
    .then(result => {
      res.status(200).json({message: "Image Deleted"});
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
};
