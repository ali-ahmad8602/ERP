export const boards = [
  {
    id: 'credit-review',
    name: 'Credit Review',
    description: 'Track credit applications through the approval pipeline',
    icon: '💳',
    color: '#0EA5E9',
    cardCount: 24,
  },
  {
    id: 'invoice-processing',
    name: 'Invoice Processing',
    description: 'Manage incoming invoices from submission to payment',
    icon: '📄',
    color: '#10B981',
    cardCount: 31,
  },
  {
    id: 'loan-pipeline',
    name: 'Loan Pipeline',
    description: 'End-to-end loan application tracking and disbursement',
    icon: '🏦',
    color: '#8B5CF6',
    cardCount: 18,
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Evaluate and monitor risk profiles for active clients',
    icon: '🛡️',
    color: '#F59E0B',
    cardCount: 12,
  },
  {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    description: 'New client setup, KYC verification and account activation',
    icon: '🤝',
    color: '#EC4899',
    cardCount: 9,
  },
  {
    id: 'compliance-tracker',
    name: 'Compliance Tracker',
    description: 'Regulatory compliance tasks and audit preparation',
    icon: '📋',
    color: '#FF3B3B',
    cardCount: 15,
  },
]

export const columns = {
  'credit-review': [
    {
      id: 'col-1',
      title: 'Submitted',
      cards: [
        {
          id: 'card-1',
          title: 'Meridian Corp — $500K Credit Line',
          description: 'New credit line application for Meridian Corp. Requires full financial review and collateral assessment before committee approval.',
          status: 'new',
          priority: 'high',
          assignee: 'Sarah Chen',
          department: 'Credit Operations',
          date: '2026-03-28',
          activity: [
            { user: 'Sarah Chen', action: 'Created card', time: '2026-03-28T09:00:00Z' },
          ],
        },
        {
          id: 'card-2',
          title: 'Apex Holdings — Credit Increase',
          description: 'Request to increase existing credit facility from $200K to $350K. Client has strong payment history over 18 months.',
          status: 'new',
          priority: 'medium',
          assignee: 'Marcus Webb',
          department: 'Credit Operations',
          date: '2026-03-27',
          activity: [
            { user: 'Marcus Webb', action: 'Created card', time: '2026-03-27T14:30:00Z' },
            { user: 'Sarah Chen', action: 'Added comment', time: '2026-03-27T15:10:00Z' },
          ],
        },
        {
          id: 'card-3',
          title: 'NovaFin LLC — Revolving Facility',
          description: 'Revolving credit facility application. Pending documentation from client on Q4 financials.',
          status: 'new',
          priority: 'low',
          assignee: 'Priya Patel',
          department: 'Credit Operations',
          date: '2026-03-26',
          activity: [
            { user: 'Priya Patel', action: 'Created card', time: '2026-03-26T11:00:00Z' },
          ],
        },
      ],
    },
    {
      id: 'col-2',
      title: 'In Review',
      cards: [
        {
          id: 'card-4',
          title: 'TechNova Inc — Trade Finance',
          description: 'Trade finance credit review. All documentation received. Analyst review in progress with risk team.',
          status: 'in_progress',
          priority: 'high',
          assignee: 'James Liu',
          department: 'Credit Operations',
          date: '2026-03-25',
          activity: [
            { user: 'James Liu', action: 'Created card', time: '2026-03-24T10:00:00Z' },
            { user: 'James Liu', action: 'Moved to In Review', time: '2026-03-25T09:00:00Z' },
            { user: 'Amina Okafor', action: 'Started review', time: '2026-03-25T11:30:00Z' },
          ],
        },
        {
          id: 'card-5',
          title: 'Global Trade Co — $1.2M Facility',
          description: 'Large facility request requiring committee approval. Preliminary risk score: B+. Awaiting final assessment.',
          status: 'in_progress',
          priority: 'critical',
          assignee: 'Amina Okafor',
          department: 'Risk & Compliance',
          date: '2026-03-24',
          activity: [
            { user: 'Amina Okafor', action: 'Created card', time: '2026-03-22T08:00:00Z' },
            { user: 'Amina Okafor', action: 'Moved to In Review', time: '2026-03-24T10:00:00Z' },
          ],
        },
      ],
    },
    {
      id: 'col-3',
      title: 'Approved',
      cards: [
        {
          id: 'card-6',
          title: 'Stellar Industries — Equipment Finance',
          description: 'Equipment financing approved. $750K facility at 4.2% over 36 months. Documentation sent to client for signatures.',
          status: 'approved',
          priority: 'medium',
          assignee: 'Daniel Park',
          department: 'Treasury',
          date: '2026-03-23',
          activity: [
            { user: 'Daniel Park', action: 'Created card', time: '2026-03-20T09:00:00Z' },
            { user: 'Sarah Chen', action: 'Approved', time: '2026-03-23T16:00:00Z' },
          ],
        },
        {
          id: 'card-7',
          title: 'BluePeak Ventures — Working Capital',
          description: 'Working capital line approved for $300K. Standard terms applied. Client has been notified.',
          status: 'approved',
          priority: 'low',
          assignee: 'Sarah Chen',
          department: 'Credit Operations',
          date: '2026-03-22',
          activity: [
            { user: 'Marcus Webb', action: 'Created card', time: '2026-03-18T11:00:00Z' },
            { user: 'Sarah Chen', action: 'Approved', time: '2026-03-22T14:00:00Z' },
          ],
        },
      ],
    },
    {
      id: 'col-4',
      title: 'Done',
      cards: [
        {
          id: 'card-8',
          title: 'Pinnacle Group — Invoice Factoring',
          description: 'Invoice factoring facility fully disbursed. All documentation filed. Account active and monitored.',
          status: 'done',
          priority: 'medium',
          assignee: 'Priya Patel',
          department: 'Invoice Processing',
          date: '2026-03-20',
          activity: [
            { user: 'Priya Patel', action: 'Created card', time: '2026-03-15T10:00:00Z' },
            { user: 'James Liu', action: 'Reviewed', time: '2026-03-18T09:00:00Z' },
            { user: 'Sarah Chen', action: 'Approved', time: '2026-03-19T14:00:00Z' },
            { user: 'Priya Patel', action: 'Marked as Done', time: '2026-03-20T16:00:00Z' },
          ],
        },
      ],
    },
  ],
}

// Generate default columns for boards that don't have specific data
export function getColumnsForBoard(boardId) {
  if (columns[boardId]) return columns[boardId]

  const board = boards.find((b) => b.id === boardId)
  if (!board) return []

  return [
    { id: `${boardId}-todo`, title: 'Todo', cards: [] },
    { id: `${boardId}-progress`, title: 'In Progress', cards: [] },
    { id: `${boardId}-review`, title: 'Review', cards: [] },
    { id: `${boardId}-done`, title: 'Done', cards: [] },
  ]
}
