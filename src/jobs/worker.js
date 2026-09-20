import "dotenv/config";
import { Worker } from "bullmq";
import { createRedisConnection } from "../config/redis.js";
import { sendEmail } from "../utils/email.js";

const connection = createRedisConnection();

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    await sendEmail(job.data.to, job.data.subject, job.data.html);
  },
  { connection, concurrency: 5 }
);

const notificationWorker = new Worker(
  "notificationQueue",
  async (job) => {
    await sendEmail(job.data.to, job.data.subject, job.data.html);
  },
  { connection, concurrency: 5 }
);

emailWorker.on("completed", (job) => {
  console.log(`Booking email sent for job ${job.id}`);
});

notificationWorker.on("completed", (job) => {
  console.log(`Event update email sent for job ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Booking email failed for job ${job?.id}:`, error.message);
});

notificationWorker.on("failed", (job, error) => {
  console.error(`Event update email failed for job ${job?.id}:`, error.message);
});

console.log("Background workers started");
