import { z } from "zod";

export const roleValidator = z.enum(["superAdmin", "admin", "teacher", "student"]);
