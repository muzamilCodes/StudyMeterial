import { RoleAuthPanel } from "@/components/role-auth-panel";

export default function StudentLoginPage() {
  return (
    <RoleAuthPanel
      role="student"
      mode="login"
      title="Student Login"
      description="Continue your learning journey"
      accent="from-blue-500 via-indigo-600 to-cyan-700"
      homeHref="/student"
    />
  );
}
