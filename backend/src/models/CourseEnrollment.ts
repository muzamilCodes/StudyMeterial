import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    courseId:        { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    studentId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName:     { type: String, required: true },
    email:           { type: String, required: true, lowercase: true },
    completedLessons: { type: [String], default: [] }
  },
  { timestamps: true }
);

enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export const CourseEnrollmentModel = mongoose.model("CourseEnrollment", enrollmentSchema);
