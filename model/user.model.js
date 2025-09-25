const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  DeviceId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  username: { type: String, required: true },
  Avtaar: { type: String },
});

const Usermodel = mongoose.model("User", userSchema);

module.exports = Usermodel;
