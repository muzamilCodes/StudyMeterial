import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, enum: ["10th", "11th", "12th"], required: true },
  stream: { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true }
}, { timestamps: true });

export const ExamModel = mongoose.model("Exam", examSchema);
