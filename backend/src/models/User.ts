import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:    { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role:   { type: String, enum: ["superAdmin", "admin", "teacher", "student"], default: "student" },
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    grade:  { type: String, enum: ["10th", "11th", "12th"], required: true },
    stream: { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true },
    resetTokenHash:    { type: String },
    resetTokenExpires: { type: Date }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const UserModel = mongoose.model("User", userSchema);
