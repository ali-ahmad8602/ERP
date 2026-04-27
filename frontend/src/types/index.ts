export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  orgRole: string;
  departments: string[];
  boardPermissions: string[];
  createdAt: string;
}

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
  department: {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
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
