import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}
