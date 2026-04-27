import type { Card, Column } from "./types"

const assignees = {
  jd: { id: "1", name: "John Doe", initials: "JD" },
  as: { id: "2", name: "Alice Smith", initials: "AS" },
  mb: { id: "3", name: "Mike Brown", initials: "MB" },
  ej: { id: "4", name: "Emily Johnson", initials: "EJ" },
  rw: { id: "5", name: "Robert Wilson", initials: "RW" },
}

export const initialCards: Card[] = [
  {
    id: "1",
    title: "Automate invoice reconciliation",
    description: "Build automated system to match invoices with purchase orders and receipts.",
    priority: "high",
    dueDate: "Apr 30",
    assignees: [assignees.jd, assignees.as],
    comments: [
      { id: "c1", author: assignees.jd, content: "Initial scope defined", createdAt: "2 hours ago" }
    ],
    attachments: [
      { id: "a1", name: "requirements.pdf", size: "245 KB", type: "pdf" }
    ],
    amount: "$12,450",
    referenceId: "INV-2024-001",
    columnId: "ideas"
  },
  {
    id: "2",
    title: "Vendor payment integration",
    description: "Integrate with banking APIs for automated vendor payments.",
    priority: "medium",
    dueDate: "May 5",
    assignees: [assignees.mb],
    comments: [],
    attachments: [],
    referenceId: "INV-2024-002",
    columnId: "ideas"
  },
  {
    id: "3",
    title: "Q1 Financial report",
    description: "Compile and verify Q1 financial statements for board review.",
    priority: "high",
    dueDate: "Apr 28",
    assignees: [assignees.as, assignees.ej],
    comments: [
      { id: "c2", author: assignees.as, content: "Data collection complete", createdAt: "1 day ago" },
      { id: "c3", author: assignees.ej, content: "Ready for review", createdAt: "5 hours ago" }
    ],
    attachments: [
      { id: "a2", name: "q1-draft.xlsx", size: "1.2 MB", type: "xlsx" },
      { id: "a3", name: "supporting-docs.zip", size: "4.5 MB", type: "zip" }
    ],
    amount: "$2.4M",
    referenceId: "RPT-2024-Q1",
    columnId: "backlog"
  },
  {
    id: "4",
    title: "Tax compliance audit",
    description: "Prepare documentation for annual tax compliance review.",
    priority: "medium",
    dueDate: "May 15",
    assignees: [assignees.rw],
    comments: [],
    attachments: [],
    referenceId: "AUD-2024-001",
    columnId: "backlog"
  },
  {
    id: "5",
    title: "Client billing system update",
    description: "Update billing templates and automate recurring invoices.",
    priority: "high",
    dueDate: "Apr 29",
    assignees: [assignees.jd, assignees.mb, assignees.as],
    comments: [
      { id: "c4", author: assignees.jd, content: "Backend changes deployed", createdAt: "3 hours ago" }
    ],
    attachments: [],
    amount: "$8,200",
    referenceId: "INV-2024-003",
    columnId: "in-progress"
  },
  {
    id: "6",
    title: "Expense tracking module",
    description: "Implement expense categorization and approval workflows.",
    priority: "low",
    dueDate: "May 10",
    assignees: [assignees.ej],
    comments: [],
    attachments: [],
    columnId: "in-progress"
  },
  {
    id: "7",
    title: "Payment gateway migration",
    description: "Migrate from legacy payment processor to Stripe integration.",
    priority: "high",
    dueDate: "Apr 27",
    assignees: [assignees.mb, assignees.rw],
    comments: [
      { id: "c5", author: assignees.mb, content: "Testing in staging environment", createdAt: "1 hour ago" },
      { id: "c6", author: assignees.rw, content: "Security review pending", createdAt: "30 min ago" }
    ],
    attachments: [
      { id: "a4", name: "migration-plan.pdf", size: "890 KB", type: "pdf" }
    ],
    amount: "$45,000",
    referenceId: "PAY-2024-001",
    columnId: "in-review"
  },
  {
    id: "8",
    title: "Invoice template redesign",
    description: "Update invoice templates with new branding guidelines.",
    priority: "low",
    dueDate: "May 1",
    assignees: [assignees.as],
    comments: [
      { id: "c7", author: assignees.as, content: "Design approved by marketing", createdAt: "4 hours ago" }
    ],
    attachments: [],
    referenceId: "DES-2024-001",
    columnId: "in-review"
  },
  {
    id: "9",
    title: "Multi-currency support",
    description: "Enable invoicing in EUR, GBP, and CAD with automatic exchange rates.",
    priority: "medium",
    dueDate: "Apr 25",
    assignees: [assignees.jd, assignees.ej],
    comments: [
      { id: "c8", author: assignees.jd, content: "Deployed to production", createdAt: "2 days ago" }
    ],
    attachments: [],
    referenceId: "FEA-2024-001",
    columnId: "done"
  },
  {
    id: "10",
    title: "Client onboarding automation",
    description: "Automated email sequences and document collection for new clients.",
    priority: "medium",
    dueDate: "Apr 20",
    assignees: [assignees.rw],
    comments: [],
    attachments: [],
    referenceId: "AUT-2024-001",
    columnId: "done"
  }
]

export const columns: Column[] = [
  { id: "ideas", title: "Ideas", cards: [] },
  { id: "backlog", title: "Backlog", cards: [] },
  { id: "in-progress", title: "In Progress", cards: [] },
  { id: "in-review", title: "In Review", cards: [] },
  { id: "done", title: "Done", cards: [] },
]
