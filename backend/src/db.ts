import mongoose from "mongoose";
import { env } from "./config/env.js";

export async function connectDB() {
  const uri = env.mongoUri;
  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${uri}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
}
