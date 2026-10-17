import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export const SuperAdminModel = mongoose.model("SuperAdmin", superAdminSchema);
