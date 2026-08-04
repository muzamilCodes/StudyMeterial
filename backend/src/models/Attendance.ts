import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    classId:     { type: String, required: true },
    studentName: { type: String, required: true },
    email:       { type: String, required: true },
    joinTime:    { type: String, required: true },
    status:      { type: String, required: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
