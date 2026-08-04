import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    subject:  { type: String, required: true },
    title:    { type: String, required: true },
    year:     { type: String, required: true },
    term:     { type: String, required: true },
    grade:    { type: String, enum: ["10th", "11th", "12th"], required: true },
    stream:   { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true },
    fileUrl:  { type: String, required: true },
    fileSize: { type: String, required: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const PaperModel = mongoose.model("Paper", paperSchema);
