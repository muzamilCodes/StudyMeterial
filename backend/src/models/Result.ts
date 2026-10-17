import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  examId: { type: String, required: true },
  score: { type: Number, required: true }
}, { timestamps: true });

export const ResultModel = mongoose.model("Result", resultSchema);
