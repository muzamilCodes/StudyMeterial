import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  { title: String, type: String, url: String, size: String },
  { _id: false }
);

const liveClassSchema = new mongoose.Schema(
  {
    title:                 { type: String, required: true },
    subject:               { type: String, required: true },
    category:              { type: String, required: true },
    description:           { type: String, required: true },
    teacherName:           { type: String, required: true },
    teacherPhoto:          { type: String },
    teacherBio:            { type: String },
    date:                  { type: String, required: true },
    startTime:             { type: String, required: true },
    endTime:               { type: String, required: true },
    duration:              { type: String, required: true },
    timeZone:              { type: String },
    meetingPlatform:       { type: String, enum: ["Google Meet", "Zoom", "Jitsi", "LiveKit", "Custom"], required: true },
    meetingLink:           { type: String, required: true },
    meetingId:             { type: String },
    meetingPassword:       { type: String },
    maxStudents:           { type: Number, required: true },
    enrolledStudentsCount: { type: Number, default: 0 },
    language:              { type: String, required: true },
    difficultyLevel:       { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    bannerUrl:             { type: String },
    thumbnailUrl:          { type: String },
    tags:                  [String],
    status:                { type: String, enum: ["Draft", "Published", "Upcoming", "Starting Soon", "Live", "Completed", "Recording Available", "Archived"], required: true },
    allowRecording:        { type: Boolean, default: false },
    allowChat:             { type: Boolean, default: true },
    allowScreenShare:      { type: Boolean, default: false },
    allowStudentQuestions: { type: Boolean, default: true },
    attachments:           [attachmentSchema],
    prerequisites:         [String],
    learningOutcomes:      [String],
    recordingUrl:          { type: String },
    homeworkUrl:           { type: String },
    grade:                 { type: String, enum: ["10th", "11th", "12th"], required: true },
    stream:                { type: String, enum: ["General", "Medical", "Non-Medical", "Commerce", "Arts"], required: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const LiveClassModel = mongoose.model("LiveClass", liveClassSchema);
