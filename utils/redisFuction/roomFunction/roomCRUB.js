const { v4: uuidv4 } = require("uuid");
const redis = require("../../../model/redis/db.connection");

const ROOM_TTL_SECONDS = 3600;

// Save user profile separately
async function saveUserProfile(user) {
  const key = `userProfile:${user.userId}`;
  await redis.hmset(key, {
    userId: user.userId,
    name: user.name || "",
    avatar: user.avatar || "",
  });
  await redis.expire(key, ROOM_TTL_SECONDS); // optional TTL
}

// Get user profile by id
async function getUserProfile(userId) {
  const data = await redis.hgetall(`userProfile:${userId}`);
  if (!data || !data.userId) return null;
  return {
    userId: data.userId,
    name: data.name,
    avatar: data.avatar,
  };
}

async function joinQueue(user, language, waitingFor) {
  const userKey = `queue:${language}`;

  await redis.hset(userKey, {
    username: user.name,
    avatar: user.avatar,
    waitingFrom: Date.now().toString(), // ✅ store timestamp here
    userId: "68cda866cf0ee5294qw322",
  });
}

async function matchOrWait(user, language, waitingFor) {
  const queueKey = `queue:${language}`;

  // Get all users in this queue
  const allUsers = await redis.hgetall(queueKey);
  const otherUserIds = Object.keys(allUsers).filter((id) => id !== user.userId);

  if (otherUserIds.length === 0) {
    // No one to match, join queue
    await joinQueue(user, language, waitingFor);
    return null;
  }

  // Find the user who has waited the longest
  let oldestUserId = null;
  let oldestTimestamp = Infinity;

  for (const id of otherUserIds) {
    const userData = JSON.parse(allUsers[id]);
    const waitingFrom = parseInt(userData.waitingFrom, 10);

    if (waitingFrom < oldestTimestamp) {
      oldestTimestamp = waitingFrom;
      oldestUserId = id;
    }
  }

  const oldestUserData = JSON.parse(allUsers[oldestUserId]);

  // Create room
  const roomId = await createRoom(oldestUserData, user, language);

  // Remove both users from queue
  await redis.hdel(queueKey, oldestUserId);
  await redis.hdel(queueKey, user.userId);

  return roomId;
}

async function createRoom(user1, user2, language) {
  const roomId = uuidv4();
  const key = `room:${roomId}`;
  const startedAt = Date.now();

  await redis.hmset(key, {
    user1Id: user1.userId,
    user1Name: user1.name || "",
    user1Avatar: user1.avatar || "",
    user2Id: user2.userId,
    user2Name: user2.name || "",
    user2Avatar: user2.avatar || "",
    language,
    startedAt,
  });

  await redis.expire(key, ROOM_TTL_SECONDS);

  return roomId;
}

async function getActiveRoom(roomId) {
  const key = `room:${roomId}`;
  const data = await redis.hgetall(key);

  if (!data || Object.keys(data).length === 0) return null;

  return {
    user1: {
      userId: data.user1Id,
      name: data.user1Name,
      avatar: data.user1Avatar,
    },
    user2: {
      userId: data.user2Id,
      name: data.user2Name,
      avatar: data.user2Avatar,
    },
    language: data.language,
    startedAt: data.startedAt,
  };
}

async function leaveRoom(roomId) {
  const key = `room:${roomId}`;
  if (!(await redis.exists(key))) return;
  await redis.del(key);
}

module.exports = {
  saveUserProfile,
  getUserProfile,
  joinQueue,
  matchOrWait,
  createRoom,
  getActiveRoom,
  leaveRoom,
};
