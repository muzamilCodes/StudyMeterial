import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: { type: String },
  action: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export const ActivityLogModel = mongoose.model("ActivityLog", activityLogSchema);
