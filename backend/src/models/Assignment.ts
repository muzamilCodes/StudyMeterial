import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  subject: { type: String, required: true },
  grade: { type: String, enum: ["10th", "11th", "12th"], required: true },
  stream: { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true },
  deadline: { type: String, default: "" },
  marks: { type: Number, default: 50 },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  instructorName: { type: String, default: "Faculty" }
}, { timestamps: true });

export const AssignmentModel = mongoose.model("Assignment", assignmentSchema);
