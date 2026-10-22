import mongoose from "mongoose";
import { connectDB } from "../db.js";

export async function connectDatabase() {
  await connectDB();
  return mongoose.connection;
}
