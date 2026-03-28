export const overviewStats = {
  totalCards: 284,
  doneCount: 127,
  inProgressCount: 89,
  overdueCount: 23,
  pendingApprovals: 14,
  complianceItems: 31,
  createdThisWeek: 42,
  createdThisMonth: 156,
}

export const departmentBreakdown = [
  {
    department: { _id: '1', name: 'Credit Operations', slug: 'credit-operations', icon: '💳', color: '#0EA5E9' },
    totalCards: 78, doneCount: 45, inProgressCount: 22, overdueCount: 11, memberCount: 12,
  },
  {
    department: { _id: '2', name: 'Invoice Processing', slug: 'invoice-processing', icon: '📄', color: '#10B981' },
    totalCards: 64, doneCount: 38, inProgressCount: 19, overdueCount: 7, memberCount: 8,
  },
  {
    department: { _id: '3', name: 'Risk & Compliance', slug: 'risk-compliance', icon: '🛡️', color: '#F59E0B' },
    totalCards: 52, doneCount: 20, inProgressCount: 25, overdueCount: 7, memberCount: 6,
  },
  {
    department: { _id: '4', name: 'Treasury', slug: 'treasury', icon: '🏦', color: '#8B5CF6' },
    totalCards: 45, doneCount: 12, inProgressCount: 18, overdueCount: 5, memberCount: 5,
  },
  {
    department: { _id: '5', name: 'Client Relations', slug: 'client-relations', icon: '🤝', color: '#EC4899' },
    totalCards: 45, doneCount: 12, inProgressCount: 5, overdueCount: 3, memberCount: 9,
  },
]

export const statusDistribution = [
  { name: 'Done', value: 127, color: '#10B981' },
  { name: 'In Progress', value: 89, color: '#0EA5E9' },
  { name: 'Backlog', value: 45, color: '#6B7280' },
  { name: 'Overdue', value: 23, color: '#FF3B3B' },
]

export const activityFeed = [
  {
    _id: '1',
    user: { name: 'Sarah Chen', avatar: null },
    action: 'card_approved',
    entityTitle: 'Q1 Invoice Batch #2847',
    detail: 'Approved credit limit increase for Meridian Corp',
    department: { name: 'Credit Operations', icon: '💳' },
    board: { name: 'Approvals Board' },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    _id: '2',
    user: { name: 'Marcus Webb', avatar: null },
    action: 'card_moved',
    entityTitle: 'Risk Assessment — Apex Holdings',
    detail: 'Moved from In Review to Done',
    department: { name: 'Risk & Compliance', icon: '🛡️' },
    board: { name: 'Compliance Tracker' },
    createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
  },
  {
    _id: '3',
    user: { name: 'Priya Patel', avatar: null },
    action: 'comment_added',
    entityTitle: 'Vendor Payment #INV-1092',
    detail: 'Added notes on payment discrepancy resolution',
    department: { name: 'Invoice Processing', icon: '📄' },
    board: { name: 'Active Invoices' },
    createdAt: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
  },
  {
    _id: '4',
    user: { name: 'James Liu', avatar: null },
    action: 'card_created',
    entityTitle: 'Monthly Treasury Reconciliation',
    detail: 'Created new task for March 2026 cycle',
    department: { name: 'Treasury', icon: '🏦' },
    board: { name: 'Treasury Ops' },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    _id: '5',
    user: { name: 'Amina Okafor', avatar: null },
    action: 'card_rejected',
    entityTitle: 'Credit Extension — NovaFin LLC',
    detail: 'Rejected due to insufficient collateral documentation',
    department: { name: 'Credit Operations', icon: '💳' },
    board: { name: 'Approvals Board' },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    _id: '6',
    user: { name: 'Daniel Park', avatar: null },
    action: 'member_added',
    entityTitle: 'Client Relations',
    detail: 'Added Riya Sharma as department member',
    department: { name: 'Client Relations', icon: '🤝' },
    board: { name: 'Onboarding' },
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
]
