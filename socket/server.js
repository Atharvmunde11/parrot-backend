const { Mongoose, default: mongoose } = require("mongoose");
const QueueModel = require("../model/queue.model");
const redis = require("../model/redis/db.connection");
const roomModel = require("../model/room.model");
const {
  matchOrWait,
  getActiveRoom,
  leaveRoom,
} = require("../utils/redisFuction/roomFunction/roomCRUB");

const SOCKET_MAP_KEY = "socketMap"; // Redis hash: userId -> socketId

const socketLogin = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    socket.on(
      "ConnectOrQueue",
      async ({ userId, name, avatar, language, uuid }) => {
        try {
          console.log({ userId, name, avatar, language });

          await redis.hset(SOCKET_MAP_KEY, userId, socket.id);
          socket.userId = userId;

          // check if user with same language is waiting in the queue or add it :
          const waitingUsers = await QueueModel.find({ language })
            .sort({ waitingSince: 1 }) // ascending → oldest first
            .limit(10); // optional: limit how many you want

          console.log("Waiting users:", waitingUsers);

          if (waitingUsers.length == 0) {
            const addUserToQueue = await QueueModel.create({
              avtaar: avatar,
              language: language,
              userId: userId,
              username: name,
              uuid: uuid,
            });

            socket.roomId = addUserToQueue._id;

            console.log("added user to queue :", userId);
          } else {
            console.log("matching user to someone in the queue");
            const userIdOfOtherUser = waitingUsers[0];

            const createRoom = await roomModel.create({
              language: language,
              user1: {
                _id: userIdOfOtherUser.userId,
                avatar: userIdOfOtherUser.avtaar,
                username: userIdOfOtherUser.username,
              },
              user2: {
                _id: userId,
                avatar: avatar,
                username: name,
              },
            });

            const socketid = await redis.hget(
              SOCKET_MAP_KEY,
              waitingUsers[0].userId
            );

            console.log("socketId : ", socketid);

            if (socketid) {
              io.to(socketid).emit("matchedFound", createRoom);
              socket.emit("matchedFound", createRoom); // optional: notify the new user too
            }

            if (createRoom) await QueueModel.deleteOne({ userId: userId });
          }
        } catch (err) {
          console.error("Error in ConnectOrQueue:", err);
        }
      }
    );

    socket.on("DisconnectedFromRoom", async ({ roomId }) => {
      // destructure here
      console.log("roomId : ", roomId);

      // Convert string to ObjectId
      const roomObjectId = new mongoose.Types.ObjectId(roomId);

      const room = await roomModel.findById(roomObjectId); // or findOne({ _id: roomObjectId })
      if (!room) return console.log("Room not found");

      const otherMember =
        socket.userId === room.user1._id.toString()
          ? room.user2._id
          : room.user1._id;

      const otherMemberSocketId = await redis.hget(
        SOCKET_MAP_KEY,
        otherMember.toString()
      );

      console.log("other member socket id : ", otherMemberSocketId);

      if (otherMemberSocketId) {
        io.to(otherMemberSocketId).emit("DisconnectedFromRoom");
      }

      await roomModel.deleteOne({ _id: roomObjectId });
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected: " + socket.id);
      await redis.hdel(SOCKET_MAP_KEY, socket.userId);
      // await QueueModel.deleteMany({ userId: socket.userId });
      console.log("users delete from queue");
    });
  });
};

module.exports = socketLogin;
