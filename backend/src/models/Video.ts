import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    subject:    { type: String, required: true },
    title:      { type: String, required: true },
    instructor: { type: String, required: true },
    duration:   { type: String, required: true },
    thumbnail:  { type: String, required: true },
    videoUrl:   { type: String, required: true },
    views:      { type: Number, default: 0, min: 0 },
    grade:      { type: String, enum: ["10th", "11th", "12th"], required: true },
    stream:     { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

videoSchema.index({ grade: 1, stream: 1, views: -1 });

export const VideoModel = mongoose.model("Video", videoSchema);
