import { useAuthStore } from "@/store/auth.store";
import type { BoardRole } from "@/types";

interface BoardPermissions {
  canEdit: boolean;       // create/edit/delete cards, manage columns
  canMove: boolean;       // drag-and-drop cards
  canComment: boolean;    // add comments
  canManageBoard: boolean; // board settings, fields, columns
  canDelete: boolean;     // delete cards
  role: BoardRole | "none";
}

const ROLE_HIERARCHY: Record<BoardRole, number> = {
  board_owner: 4,
  editor: 3,
  commenter: 2,
  viewer: 1,
};

export function useBoardPermissions(boardId: string | undefined): BoardPermissions {
  const { user } = useAuthStore();

  if (!user || !boardId) {
    return { canEdit: false, canMove: false, canComment: false, canManageBoard: false, canDelete: false, role: "none" };
  }

  // Super admins and org admins have full access
  if (["super_admin", "org_admin"].includes(user.orgRole)) {
    return { canEdit: true, canMove: true, canComment: true, canManageBoard: true, canDelete: true, role: "board_owner" };
  }

  // Check explicit board permissions
  const boardPerm = user.boardPermissions?.find(bp => bp.board === boardId);
  const role: BoardRole = boardPerm?.role ?? "editor"; // Default to editor if no explicit permission (backwards compat)

  const level = ROLE_HIERARCHY[role] ?? 1;

  return {
    canEdit: level >= ROLE_HIERARCHY.editor,
    canMove: level >= ROLE_HIERARCHY.editor,
    canComment: level >= ROLE_HIERARCHY.commenter,
    canManageBoard: level >= ROLE_HIERARCHY.board_owner,
    canDelete: level >= ROLE_HIERARCHY.editor,
    role,
  };
}
