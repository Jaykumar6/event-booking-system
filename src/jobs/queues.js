import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis.js";

const connection = createRedisConnection();

export const emailQueue = connection ? new Queue("emailQueue", { connection }) : null;
export const notificationQueue = connection ? new Queue("notificationQueue", { connection }) : null;
