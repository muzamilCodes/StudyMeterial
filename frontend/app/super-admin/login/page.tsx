import { RoleAuthPanel } from "@/components/role-auth-panel";

export default function SuperAdminLoginPage() {
  return (
    <RoleAuthPanel
      role="superAdmin"
      mode="login"
      title="Super Admin Login"
      description="Lead the whole system"
      accent="from-cyan-500 via-blue-600 to-indigo-700"
      homeHref="/super-admin"
    />
  );
}
