import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  label: { type: String, required: true },
  grade: { type: String, enum: ["10th", "11th", "12th"], required: true },
  stream: { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true }
}, { timestamps: true });

export const ClassModel = mongoose.model("Class", classSchema);
