import { RoleAuthPanel } from "@/components/role-auth-panel";

export default function TeacherLoginPage() {
  return (
    <RoleAuthPanel
      role="teacher"
      mode="login"
      title="Teacher Login"
      description="Enter your teaching workspace"
      accent="from-rose-500 via-orange-500 to-amber-500"
      homeHref="/teacher"
    />
  );
}
