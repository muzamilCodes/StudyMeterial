import mongoose from "mongoose";

const courseReviewSchema = new mongoose.Schema(
  {
    courseId:    { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    studentId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    comment:     { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

courseReviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export const CourseReviewModel = mongoose.model("CourseReview", courseReviewSchema);
