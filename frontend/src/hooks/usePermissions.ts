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

  const canApprove = (approvers: string[]) => approvers.includes(user?._id ?? "")

  const guardAction = (action: string, context?: { boardId?: string; deptId?: string; approvers?: string[] }): boolean => {
    const boardId = context?.boardId || ""
    const deptId = context?.deptId || ""
    const approvers = context?.approvers || []

    switch (action) {
      case "create_card":
      case "move_card":
      case "edit_card":
        return canEditCards(boardId)
      case "delete_card":
        return isAdmin
      case "comment":
        return canComment(boardId)
      case "approve":
        return canApprove(approvers)
      case "create_board":
        return canEditBoard(deptId) || isAdmin
      case "delete_board":
        return canEditBoard(boardId) || isAdmin
      case "manage_members":
        return isAdmin
      case "access_settings":
        return isAdmin
      default:
        return false
    }
  }

  return {
    canCreateDept: isAdmin,
    canManageUsers: isAdmin,
    canInvite: isAdmin,
    canAccessOrgSettings: isAdmin,
    canApprove,
    isAdmin,
    orgRole,
    getBoardRole,
    canEditBoard,
    canEditCards,
    canComment,
    guardAction,
  }
}
