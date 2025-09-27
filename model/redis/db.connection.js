const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis({
  port: process.env.REDIS_PORT || 26379, // Redis port
  host: process.env.REDIS_HOST, // Redis host
  username: process.env.REDIS_USERNAME || "default", // Redis username
  password: process.env.REDIS_PASSWORD, // Redis password
  tls: {}, // required by Aiven
  dnsLookup: (hostname, callback) => {
    require("dns").lookup(hostname, { family: 4 }, callback);
  },
});

redis.on("connect", () => console.log("✅ Connected to Valkey/Redis!"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));

module.exports = redis;
