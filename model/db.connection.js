const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUser = process.env.MONGO_USER;
    const mongoPassword = process.env.MONGO_PASSWORD;
    const mongoHost = process.env.MONGO_HOST;
    const mongoDb = process.env.MONGO_DB;
    const uri = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoHost}/${mongoDb}`;

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;
