const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: false,
  },
  uuid: { type: Number },
  waitingSince: { type: Date, default: Date.now },
  language: { type: String, required: true },
  avtaar: { type: String },
  username: { type: String, required: true },
});

const QueueModel = mongoose.model("Queue", QueueSchema);

module.exports = QueueModel;
