// backend/token.js
const express = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const morgan = require("morgan");
const connectDB = require("./model/db.connection");
const userRoute = require("./routes/user.route");
// const Redis = require("./model/redis/db.connection");

const APP_ID = "55bd35ed4f334012a3878acfecceb522";
const APP_CERTIFICATE = "192561f96c2f457597e461b21e823143";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/v1/user", userRoute);

app.get("/token", (req, res) => {
  const { uuid, channel } = req.query;

  console.log("uuid :", uuid);
  if (!uuid || !channel) {
    return res.status(400).send("Missing uid or channel");
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channel,
    uuid,
    role,
    privilegeExpireTs
  );

  console.log("token", token);

  res.json({ token: token });
});

// Initialize http server and socket.io
const http = require("http");
const socketIO = require("socket.io");
const socketLogin = require("./socket/server");

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketLogin(io);

server.listen(3000, () => console.log("Token server running on port 3000"));
