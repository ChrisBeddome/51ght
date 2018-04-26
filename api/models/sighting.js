const mongoose = require("mongoose");
const comment = require("./comment").schema;

const sightingSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {type: String, required: true},
  userName: {type: String, required: true},
  title: {type: String, required: true },
  description: {type: String, required: true },
  date: {type: Date, required: true},
  position: {
    lat: {type: Number, required: true},
    long: {type: Number, required: true}
  },
  imageURL: {type: String, required: false},
  comments: {type: [comment], required: true}
});

module.exports = {
  model: mongoose.model("Sighting", sightingSchema),
  schema: sightingSchema
}