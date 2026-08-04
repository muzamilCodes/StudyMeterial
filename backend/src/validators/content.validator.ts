import { z } from "zod";

export const gradeValidator = z.enum(["10th", "11th", "12th"]);
export const streamValidator = z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]);
