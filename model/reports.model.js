const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true },
  reason: { type: String, reqired: true },
});

const ReportModel = mongoose.model("report", ReportSchema);

module.exports = ReportModel;
