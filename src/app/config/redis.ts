/* eslint-disable no-console */
import { createClient } from "redis";
import { envVars } from "./envVars";

export const redisClient = createClient({
  username: envVars.REDIS_USERNAME || "default",
  password: envVars.REDIS_PASSWORD,
  socket: {
    host: envVars.REDIS_HOST,
    port: parseInt(envVars.REDIS_PORT),
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis Connected");
  } catch (error) {
    console.error("Redis Connection Failed:", error);
  }
};
