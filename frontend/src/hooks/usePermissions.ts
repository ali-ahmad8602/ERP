import { useAuthStore } from "@/store/auth.store"

export function usePermissions() {
  const { user } = useAuthStore()
  const orgRole = user?.orgRole ?? "user"

  return {
    canCreateDept: ["super_admin", "org_admin"].includes(orgRole),
    canManageUsers: ["super_admin", "org_admin"].includes(orgRole),
    canInvite: ["super_admin", "org_admin"].includes(orgRole),
    canAccessOrgSettings: ["super_admin", "org_admin"].includes(orgRole),
    canApprove: (approvers: string[]) => approvers.includes(user?._id ?? ""),
    isAdmin: ["super_admin", "org_admin"].includes(orgRole),
    orgRole,
  }
}
