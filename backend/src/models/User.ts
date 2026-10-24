import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:    { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role:   { type: String, enum: ["superAdmin", "admin", "teacher", "student"], default: "student" },
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    grade:  { type: String, default: "11th" },
    stream: { type: String, default: "General" },

    // Instructor-specific permissions & profile
    teachingPermissions: {
      classes:       { type: [String], default: [] },
      subjects:      { type: [String], default: [] },
      classSubjects: {
        type: [{
          class:    { type: String, required: true },
          subjects: { type: [String], default: [] }
        }],
        default: []
      }
    },
    headline:           { type: String, default: "" },
    bio:                { type: String, default: "" },
    teachingExperience: { type: String, default: "" },
    currentOccupation:  { type: String, default: "" },
    preferredLanguage:  { type: String, default: "English" },
    profilePhotoUrl:    { type: String, default: "" },

    permissionRequests: [
      {
        requestedClasses:       { type: [String], default: [] },
        requestedSubjects:      { type: [String], default: [] },
        requestedClassSubjects: [{ class: String, subjects: [String] }],
        reason:                 { type: String, default: "" },
        status:                 { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        reviewNote:             { type: String },
        reviewedBy:             { type: String },
        reviewedAt:             { type: Date },
        createdAt:              { type: Date, default: Date.now }
      }
    ],

    resetTokenHash:    { type: String },
    resetTokenExpires: { type: Date }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const UserModel = mongoose.model("User", userSchema);
