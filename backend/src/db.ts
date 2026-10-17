import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/studymaterial";
  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${uri}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
}
