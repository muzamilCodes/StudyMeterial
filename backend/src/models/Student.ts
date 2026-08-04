import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  grade: { type: String, enum: ["10th", "11th", "12th"], required: true },
  stream: { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true }
}, { timestamps: true });

export const StudentModel = mongoose.model("Student", studentSchema);
