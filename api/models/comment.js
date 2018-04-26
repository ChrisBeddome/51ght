const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {type: String, required: true },
  userName: {type: String, required: true},
  date: {type: Date, required: true},
  content: {type: String, required: true}
});

module.exports = {
  model: mongoose.model("Comment", commentSchema),
  schema: commentSchema
}