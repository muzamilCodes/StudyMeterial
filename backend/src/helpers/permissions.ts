export const permissions = {
  superAdmin: ["*"],
  admin: ["users:read", "users:write", "classes:read", "classes:write", "attendance:read", "reports:read"],
  teacher: ["attendance:write", "assignments:write", "quizzes:write", "notes:write", "marks:write"],
  student: ["attendance:read", "assignments:read", "quizzes:read", "notes:read", "results:read"]
} as const;
