import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    subject:    { type: String, required: true },
    title:      { type: String, required: true },
    grade:      { type: String, enum: ["10th", "11th", "12th"], required: true },
    stream:     { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true },
    fileUrl:    { type: String, required: true },
    fileSize:   { type: String, required: true },
    pages:      { type: Number, required: true },
    uploadDate: { type: String }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const NoteModel = mongoose.model("Note", noteSchema);
