import { RoleAuthPanel } from "@/components/role-auth-panel";

export default function StudentRegisterPage() {
  return (
    <RoleAuthPanel
      role="student"
      mode="register"
      title="Student Registration"
      description="Join the study platform"
      accent="from-blue-500 via-indigo-600 to-cyan-700"
      homeHref="/student"
    />
  );
}
