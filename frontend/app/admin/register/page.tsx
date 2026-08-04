import { RoleAuthPanel } from "@/components/role-auth-panel";

export default function AdminRegisterPage() {
  return (
    <RoleAuthPanel
      role="admin"
      mode="register"
      title="Admin Registration"
      description="Create an administrative account"
      accent="from-emerald-500 via-teal-600 to-cyan-700"
      homeHref="/admin"
    />
  );
}
