import useAuthStore from '../store/useAuthStore'

/**
 * Central permission hook — derives UI visibility rules from the user's
 * org role, department memberships, and board permissions.
 *
 * Backend RBAC hierarchy:
 *   Org:  super_admin > org_admin > top_management > user
 *   Dept: dept_head > member > guest
 *   Board: board_owner > editor > commenter > viewer
 */

const ORG_RANK = { super_admin: 4, org_admin: 3, top_management: 2, user: 1 }
const DEPT_RANK = { dept_head: 3, member: 2, guest: 1 }
const BOARD_RANK = { board_owner: 4, editor: 3, commenter: 2, viewer: 1 }

export default function usePermissions() {
  const user = useAuthStore((s) => s.user)
  if (!user) {
    return {
      orgRole: null,
      isAdmin: false,
      isSuperAdmin: false,
      isTopManagement: false,
      canCreateBoard: false,
      canCreateCard: false,
      canEditCard: false,
      canMoveCard: false,
      canComment: false,
      canArchiveCard: false,
      canManageMembers: false,
      canAccessSettings: false,
      canInviteUsers: false,
      isReadOnly: true,
      getDeptRole: () => null,
      getBoardRole: () => null,
    }
  }

  const orgRole = user.orgRole
  const orgRank = ORG_RANK[orgRole] || 0
  const isSuperAdmin = orgRole === 'super_admin'
  const isAdmin = orgRank >= ORG_RANK.org_admin
  const isTopManagement = orgRole === 'top_management'

  /**
   * Get the user's role in a specific department.
   */
  function getDeptRole(deptId) {
    if (isSuperAdmin || isTopManagement) return 'dept_head' // effective access
    if (orgRole === 'org_admin') return 'dept_head'
    const membership = user.departments?.find(
      (d) => (d.department?._id || d.department) === deptId
    )
    return membership?.role || null
  }

  /**
   * Get the user's role on a specific board.
   * Falls back to department membership → default editor.
   */
  function getBoardRole(boardId, deptId) {
    if (isSuperAdmin) return 'board_owner'
    if (isTopManagement) return 'editor'
    if (orgRole === 'org_admin') return 'editor'

    // Check explicit board permission
    const boardPerm = user.boardPermissions?.find(
      (b) => (b.board?._id || b.board) === boardId
    )
    if (boardPerm) return boardPerm.role

    // Fall back to dept membership → editor if member
    const deptRole = getDeptRole(deptId)
    if (deptRole && DEPT_RANK[deptRole] >= DEPT_RANK.member) return 'editor'
    if (deptRole === 'guest') return 'viewer'

    return null
  }

  // ─── Org-level permissions ──────────────────────────────────────────────

  // Guests are read-only. top_management is blocked from creating boards by backend.
  const isGuest = !isSuperAdmin && !isAdmin && !isTopManagement &&
    user.departments?.length > 0 &&
    user.departments.every((d) => d.role === 'guest')

  const canCreateBoard = !isGuest && (isAdmin || (!isTopManagement && orgRank >= ORG_RANK.user))
  const canManageMembers = isAdmin
  const canInviteUsers = isAdmin
  const canAccessSettings = isAdmin // top_management explicitly blocked

  // ─── Board-level permissions (context-free defaults) ────────────────────
  // Guests are viewer-only. top_management gets editor.
  const canCreateCard = !isGuest
  const canEditCard = !isGuest
  const canMoveCard = !isGuest
  const canComment = !isGuest // commenter+ (everyone except pure guest)
  const canArchiveCard = !isGuest
  const isReadOnly = isGuest

  return {
    orgRole,
    isSuperAdmin,
    isAdmin,
    isTopManagement,
    canCreateBoard,
    canCreateCard,
    canEditCard,
    canMoveCard,
    canComment,
    canArchiveCard,
    canManageMembers,
    canAccessSettings,
    canInviteUsers,
    isReadOnly,
    getDeptRole,
    getBoardRole,
  }
}
