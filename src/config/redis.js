import IORedis from "ioredis";

export function createRedisConnection() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null
  });
}
