import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question:    { type: String, required: true },
    options:     [{ type: String, required: true }],
    answer:      { type: String, required: true },
    explanation: { type: String }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    subject:         { type: String, required: true },
    title:           { type: String, required: true },
    topic:           { type: String },
    grade:           { type: String, enum: ["10th", "11th", "12th"], required: true },
    stream:          { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true },
    durationMinutes: { type: Number, required: true },
    questions:       [questionSchema]
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const QuizModel = mongoose.model("Quiz", quizSchema);
