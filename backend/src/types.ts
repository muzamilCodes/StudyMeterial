export type Grade = "10th" | "11th" | "12th";
export type Stream = "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts";

export type JwtRole = "student" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  role: JwtRole;
  grade?: Grade;
  stream?: Stream;
};

export type ApiHandler = (req: import("express").Request, res: import("express").Response) => Promise<void> | void;
