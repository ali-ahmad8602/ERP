import { useAuthStore } from "@/store/auth.store"

export function usePermissions() {
  const { user } = useAuthStore()
  const orgRole = user?.orgRole ?? "user"
  const isAdmin = ["super_admin", "org_admin"].includes(orgRole)

  const getBoardRole = (boardId: string): "board_owner" | "editor" | "commenter" | "viewer" | null => {
    if (!user) return null
    if (isAdmin) return "board_owner"

    const perms: { board: string; role: string }[] = (user.boardPermissions ?? []) as any
    const found = perms.find((p: any) => (p.board?._id || p.board) === boardId)
    if (found) return found.role as any

    // Default: department members without explicit permission are editors
    return "editor"
  }

  const canEditBoard = (boardId: string): boolean => {
    if (isAdmin) return true
    const role = getBoardRole(boardId)
    return role === "board_owner"
  }

  const canEditCards = (boardId: string): boolean => {
    if (isAdmin) return true
    const role = getBoardRole(boardId)
    return role === "board_owner" || role === "editor"
  }

  const canComment = (boardId: string): boolean => {
    if (isAdmin) return true
    const role = getBoardRole(boardId)
    return role === "board_owner" || role === "editor" || role === "commenter"
  }

  return {
    canCreateDept: isAdmin,
    canManageUsers: isAdmin,
    canInvite: isAdmin,
    canAccessOrgSettings: isAdmin,
    canApprove: (approvers: string[]) => approvers.includes(user?._id ?? ""),
    isAdmin,
    orgRole,
    getBoardRole,
    canEditBoard,
    canEditCards,
    canComment,
  }
}
