import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  subject: { type: String },
  phone: { type: String }
}, { timestamps: true });

export const TeacherModel = mongoose.model("Teacher", teacherSchema);
