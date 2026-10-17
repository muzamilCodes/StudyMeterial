import { Router } from "express";
import { z } from "zod";
import { SubscriberModel } from "../models/Subscriber.js";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  const existing = await SubscriberModel.findOne({ email: parsed.data.email }).lean();
  if (existing) {
    return res.status(200).json({ message: "You are already subscribed to exam updates." });
  }

  await SubscriberModel.create({ email: parsed.data.email });
  return res.status(201).json({ message: "Subscribed! You will receive weekly model paper and exam date updates." });
});

router.get("/count", async (_req, res) => {
  return res.json({ count: await SubscriberModel.countDocuments() });
});

export default router;
