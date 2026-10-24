import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true, trim: true },
    description:   { type: String, default: "", trim: true },
    videoUrl:      { type: String, required: true, trim: true },
    videoSource:   { type: String, enum: ["upload", "url"], default: "upload" },
    duration:      { type: String, default: "0:00", trim: true },
    allowDownload: { type: Boolean, default: true },
    freePreview:   { type: Boolean, default: false },
    order:         { type: Number, default: 0 },
    resources:     { type: [{ name: { type: String, default: "" }, url: { type: String, required: true } }], default: [] },

    views:    { type: Number, default: 0 },
    shares:   { type: Number, default: 0 },
    likes:    { type: [{ studentId: { type: mongoose.Schema.Types.ObjectId }, name: { type: String, default: "" } }], default: [] },
    comments: { type: [{ studentId: { type: mongoose.Schema.Types.ObjectId }, name: { type: String, default: "" }, text: { type: String, required: true }, createdAt: { type: Date, default: Date.now } }], default: [] }
  },
  { _id: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true },
    lessons: { type: [lessonSchema], default: [] }
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    instructorId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    instructorName:  { type: String, required: true },
    instructorEmail: { type: String, required: true, lowercase: true },
    instructorBio:   { type: String, default: "Faculty Educator" },

    title:        { type: String, required: true, trim: true },
    thumbnail:    { type: String, default: "", trim: true },
    description:  { type: String, required: true, trim: true },
    academicLevel: { type: String, default: "Class 10", trim: true, index: true },
    subject:       { type: String, default: "Mathematics", trim: true, index: true },
    category:     { type: String, required: true, trim: true, index: true },
    grade:        { type: String, default: "All", index: true },
    stream:       { type: String, default: "All" },
    level:        { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    language:     { type: String, default: "English", trim: true },
    price:        { type: Number, min: 0, default: 0 },
    outcomes:     { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    modules:      { type: [moduleSchema], default: [] },

    status:      { type: String, enum: ["Draft", "Pending Approval", "Published"], default: "Draft", index: true },
    ratingAvg:   { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

courseSchema.index({ status: 1, category: 1, createdAt: -1 });
courseSchema.index({ status: 1, academicLevel: 1, subject: 1, createdAt: -1 });
courseSchema.index({ instructorId: 1, status: 1, createdAt: -1 });

export const CourseModel = mongoose.model("Course", courseSchema);
