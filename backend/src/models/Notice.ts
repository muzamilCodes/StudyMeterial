import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true },
    body:     { type: String, required: true },
    category: { type: String, required: true },
    date:     { type: String }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const NoticeModel = mongoose.model("Notice", noticeSchema);
