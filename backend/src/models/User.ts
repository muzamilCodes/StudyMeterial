import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:   { type: String, enum: ["superAdmin", "admin", "teacher", "student"], default: "student" },
    grade:  { type: String, enum: ["10th", "11th", "12th"], required: true },
    stream: { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true },
    resetTokenHash:    { type: String },
    resetTokenExpires: { type: Date }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const UserModel = mongoose.model("User", userSchema);
