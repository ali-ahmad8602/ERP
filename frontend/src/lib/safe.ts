// Centralized safe data utilities
// Ensures objects from the backend have all required fields with safe defaults

export interface SafeCard {
  _id: string
  title: string
  description: string
  board: string
  column: string
  assignees: any[]
  dueDate: string | null
  priority: string
  labels: string[]
  comments: any[]
  attachments: any[]
  customFields: any[]
  auditLog: any[]
  approval: any | null
  order: number
  createdAt: string
}

export function safeCard(raw: any): SafeCard {
  return {
    _id: raw?._id || raw?.id || "",
    title: raw?.title || "Untitled",
    description: raw?.description || "",
    board: raw?.board || "",
    column: raw?.column || "",
    assignees: Array.isArray(raw?.assignees) ? raw.assignees : [],
    dueDate: raw?.dueDate || null,
    priority: ["urgent", "high", "medium", "low", "none"].includes(raw?.priority) ? raw.priority : "medium",
    labels: Array.isArray(raw?.labels) ? raw.labels : [],
    comments: Array.isArray(raw?.comments) ? raw.comments : [],
    attachments: Array.isArray(raw?.attachments) ? raw.attachments : [],
    customFields: Array.isArray(raw?.customFields) ? raw.customFields : [],
    auditLog: Array.isArray(raw?.auditLog) ? raw.auditLog : [],
    approval: raw?.approval || null,
    order: typeof raw?.order === "number" ? raw.order : 0,
    createdAt: raw?.createdAt || new Date().toISOString(),
  }
}

export function safeDepartment(raw: any) {
  return {
    _id: raw?._id || "",
    name: raw?.name || "Unknown",
    slug: raw?.slug || "",
    icon: raw?.icon || "\uD83D\uDCC1",
    color: raw?.color || "#3b82f6",
    description: raw?.description || "",
    members: Array.isArray(raw?.members) ? raw.members : [],
    heads: Array.isArray(raw?.heads) ? raw.heads : [],
  }
}

export function safeUser(raw: any) {
  return {
    _id: raw?._id || "",
    name: raw?.name || "Unknown",
    email: raw?.email || "",
    avatar: raw?.avatar || null,
    orgRole: raw?.orgRole || "user",
    departments: Array.isArray(raw?.departments) ? raw.departments : [],
    boardPermissions: Array.isArray(raw?.boardPermissions) ? raw.boardPermissions : [],
  }
}

export function safeNotification(raw: any) {
  return {
    _id: raw?._id || "",
    type: raw?.type || "info",
    title: raw?.title || "",
    message: raw?.message || "",
    entityType: raw?.entityType || "card",
    entityId: raw?.entityId || "",
    department: raw?.department ? { _id: raw.department._id || "", name: raw.department.name || "", slug: raw.department.slug || "" } : null,
    isRead: Boolean(raw?.isRead),
    createdAt: raw?.createdAt || new Date().toISOString(),
  }
}
