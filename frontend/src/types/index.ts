export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  orgRole: 'super_admin' | 'org_admin' | 'top_management' | 'user';
  departments: { department: Department; role: 'dept_head' | 'member' | 'guest' }[];
  boardPermissions: { board: string; role: BoardRole }[];
  createdAt: string;
}

export type BoardRole = 'board_owner' | 'editor' | 'commenter' | 'viewer';

export interface Department {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  heads: User[];
  members: User[];
}

export interface Column {
  _id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface CustomField {
  _id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'url' | 'user';
  options?: string[];
  required: boolean;
  order: number;
}

export interface Board {
  _id: string;
  name: string;
  description?: string;
  department?: Department | string;
  isCompanyBoard: boolean;
  columns: Column[];
  customFields: CustomField[];
  settings: {
    requiresApproval: boolean;
    approvers: User[];
    isLocked: boolean;
    complianceTagging: boolean;
  };
  createdBy: User;
  createdAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface AuditEntry {
  _id: string;
  user: User;
  action: string;
  detail?: string;
  createdAt: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  board: string;
  column: string;
  assignees: User[];
  dueDate?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  labels: string[];
  customFields: { field: string; value: unknown }[];
  approval: {
    required: boolean;
    approvers: User[];
    approvedBy: User[];
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };
  attachments: { _id: string; name: string; url: string; uploadedBy?: User; uploadedAt?: string }[];
  isComplianceTagged: boolean;
  comments: Comment[];
  auditLog: AuditEntry[];
  createdBy: User;
  order: number;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface OrgOverview {
  totalCards: number;
  doneCount: number;
  inProgressCount: number;
  overdueCount: number;
  pendingApprovals: number;
  complianceItems: number;
  createdThisWeek: number;
  createdThisMonth: number;
}

export interface DeptStats {
  department: { _id: string; name: string; slug: string; icon: string; color: string };
  totalCards: number;
  doneCount: number;
  inProgressCount: number;
  overdueCount: number;
  memberCount: number;
}

export interface ActivityEntry {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  action: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  department?: { _id: string; name: string; slug: string; icon: string; color: string };
  detail?: string;
  createdAt: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  _id: string;
  recipient: string;
  type: 'task_assigned' | 'comment_added' | 'approval_requested' | 'card_approved' |
        'card_rejected' | 'due_date_reminder' | 'mentioned' | 'card_moved' | 'member_added';
  title: string;
  message: string;
  entityType: 'card' | 'board' | 'department';
  entityId: string;
  department?: { _id: string; name: string; slug: string; icon: string; color: string };
  sender?: { _id: string; name: string; avatar?: string };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ─── Invites ─────────────────────────────────────────────────────────────────

export interface Invite {
  _id: string;
  email: string;
  orgRole: string;
  departments: { department: { _id: string; name: string; slug: string; icon: string; color: string } | string; role: string }[];
  invitedBy: { _id: string; name: string; email: string };
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}
