const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // userId (string, not ObjectId)
    avatar: { type: String, required: true },
    username: { type: String, required: true },
  },
  { _id: false } // important so Mongo doesn't auto-generate another _id for subdocs
);

const roomSchema = new mongoose.Schema({
  language: { type: String, required: true },
  user1: { type: userSchema, required: true },
  user2: { type: userSchema, required: true },
});

module.exports = mongoose.model("Room", roomSchema);
