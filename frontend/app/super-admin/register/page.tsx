import { RoleAuthPanel } from "@/components/role-auth-panel";

export default function SuperAdminRegisterPage() {
  return (
    <RoleAuthPanel
      role="superAdmin"
      mode="register"
      title="Super Admin Registration"
      description="Create a master control account"
      accent="from-cyan-500 via-blue-600 to-indigo-700"
      homeHref="/super-admin"
    />
  );
}
