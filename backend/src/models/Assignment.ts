import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, enum: ["10th", "11th", "12th"], required: true },
  stream: { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true }
}, { timestamps: true });

export const AssignmentModel = mongoose.model("Assignment", assignmentSchema);
