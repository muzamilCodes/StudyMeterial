import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, required: true }
}, { timestamps: true });

export const NotificationModel = mongoose.model("Notification", notificationSchema);
