import { RoleAuthPanel } from "@/components/role-auth-panel";

export default function TeacherRegisterPage() {
  return (
    <RoleAuthPanel
      role="teacher"
      mode="register"
      title="Teacher Registration"
      description="Create a teaching profile"
      accent="from-rose-500 via-orange-500 to-amber-500"
      homeHref="/teacher"
    />
  );
}
