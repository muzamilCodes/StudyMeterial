import { RoleAuthPanel } from "@/components/role-auth-panel";

export default function AdminLoginPage() {
  return (
    <RoleAuthPanel
      role="admin"
      mode="login"
      title="Admin Login"
      description="Manage teachers, students, and classes"
      accent="from-emerald-500 via-teal-600 to-cyan-700"
      homeHref="/admin"
    />
  );
}
