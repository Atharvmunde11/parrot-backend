const { default: mongoose } = require("mongoose");
const ReportModel = require("../model/reports.model");
const Usermodel = require("../model/user.model");
const { report } = require("../routes/user.route");
const { generateRandomAvtaar } = require("../utils/randomAvtaarGenerator");
const generateUserId = require("../utils/randomNameGenerator");

const CreateAccount = async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    res.status(400).json({ error: "Email and language are required" });
    return;
  }

  const alreadyUser = await Usermodel.findOne({ DeviceId: deviceId });

  console.log("user already exists.", alreadyUser);

  if (alreadyUser) {
    res
      .status(200)
      .json({ message: "Account already exists", user: alreadyUser });

    return;
  }

  const user = await Usermodel.create({
    DeviceId: deviceId,
    username: generateUserId(),
    Avtaar: generateRandomAvtaar(),
  });

  res.status(200).json({ message: "Account created successfully", user: user });
};

const reportUser = async (req, res) => {
  const { userId, reason } = req.body;

  console.log("req.body:", req.body);

  const report = await ReportModel.create({
    userId: new mongoose.Types.ObjectId("68ce9d7f22a8a5db0be1d718"),
    reason: reason,
  });

  res.status(200).json({
    message: "report sumbited successfully",
  });
};

module.exports = { CreateAccount, reportUser };
