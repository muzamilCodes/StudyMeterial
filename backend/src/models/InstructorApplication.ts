import mongoose from "mongoose";

const instructorApplicationSchema = new mongoose.Schema(
  {
    personal: {
      fullName:        { type: String, required: true, trim: true },
      email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
      phone:           { type: String, required: true, trim: true },
      profilePhotoUrl: { type: String },
      country:         { type: String, required: true },
      state:           { type: String, required: true },
      city:            { type: String, trim: true },
      addressLine:     { type: String, trim: true },
      messageToAdmin:  { type: String, trim: true, default: "" }
    },

    professional: {
      headline:            { type: String, required: true, trim: true },
      bio:                 { type: String, required: true, trim: true },
      subjectExpertise:    { type: [String], default: [] },
      teachingExperience:  { type: String, required: true },
      currentOccupation:   { type: String, required: true }
    },

    education: {
      highestQualification: { type: String, required: true },
      degreeName:           { type: String, required: true, trim: true },
      specialization:       { type: String, trim: true },
      collegeUniversity:    { type: String, required: true, trim: true },
      passingYear:          { type: String, required: true },
      certificates:         [{ name: String, url: String, size: String }]
    },

    documents: {
      resume:               { name: String, url: String, size: String, mimeType: String },
      teachingCertificate:  { name: String, url: String, size: String, mimeType: String },
      introVideo:           { name: String, url: String, size: String, mimeType: String }
    },

    passwordHash: { type: String, required: true },

    status:       { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewNote:   { type: String },
    reviewedBy:   { type: String },
    reviewedAt:   { type: Date },
    approvedUserEmail: { type: String }
  },
  { timestamps: true }
);

export const InstructorApplicationModel = mongoose.model("InstructorApplication", instructorApplicationSchema);
