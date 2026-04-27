export type Priority = "low" | "medium" | "high"
export type ColumnId = "ideas" | "backlog" | "in-progress" | "in-review" | "done"

export interface Assignee {
  id: string
  name: string
  initials: string
}

export interface Comment {
  id: string
  author: Assignee
  content: string
  createdAt: string
}

export interface Attachment {
  id: string
  name: string
  size: string
  type: string
}

export interface AuditLogEntry {
  _id: string
  user: { name: string }
  action: string
  detail?: string
  createdAt: string
}

export interface Card {
  id: string
  title: string
  description?: string
  priority: Priority
  dueDate: string
  assignees: Assignee[]
  comments: Comment[]
  attachments: Attachment[]
  amount?: string
  referenceId?: string
  columnId: ColumnId
  auditLog?: AuditLogEntry[]
  approval?: { approvers: string[] }
}

export interface Column {
  id: ColumnId
  title: string
  cards: Card[]
}
