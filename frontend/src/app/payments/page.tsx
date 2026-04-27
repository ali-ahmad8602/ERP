"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { useAuth } from "@/hooks/useAuth"
import { Filter, ArrowUpDown, MoreHorizontal } from "lucide-react"

const paymentStats = [
  { label: "TOTAL REVENUE", value: "$2.4M" },
  { label: "RECEIVED", value: "$1.8M" },
  { label: "PENDING", value: "$420K" },
  { label: "OVERDUE", value: "$180K" },
]

const statusConfig = {
  completed: { label: "Completed", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
  pending: { label: "Pending", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  failed: { label: "Failed", bg: "bg-[#ef4444]/15", text: "text-[#ef4444]" },
} as const

type PaymentStatus = keyof typeof statusConfig

interface Transaction {
  id: string
  reference: string
  client: string
  amount: string
  method: string
  status: PaymentStatus
  date: string
}

const transactions: Transaction[] = [
  { id: "1", reference: "TXN-78432", client: "Acme Corp", amount: "$12,500.00", method: "Bank Transfer", status: "completed", date: "Apr 12, 2024" },
  { id: "2", reference: "TXN-78431", client: "TechFlow Inc", amount: "$8,200.00", method: "Credit Card", status: "pending", date: "Apr 11, 2024" },
  { id: "3", reference: "TXN-78430", client: "Global Solutions", amount: "$24,800.00", method: "Wire Transfer", status: "failed", date: "Apr 10, 2024" },
  { id: "4", reference: "TXN-78429", client: "Nexus Digital", amount: "$5,400.00", method: "Bank Transfer", status: "completed", date: "Apr 09, 2024" },
  { id: "5", reference: "TXN-78428", client: "Sterling & Co", amount: "$18,750.00", method: "Credit Card", status: "completed", date: "Apr 08, 2024" },
  { id: "6", reference: "TXN-78427", client: "Vertex Labs", amount: "$31,200.00", method: "Wire Transfer", status: "pending", date: "Apr 07, 2024" },
  { id: "7", reference: "TXN-78426", client: "Pinnacle Group", amount: "$9,600.00", method: "Bank Transfer", status: "completed", date: "Apr 06, 2024" },
  { id: "8", reference: "TXN-78425", client: "Horizon Media", amount: "$14,300.00", method: "Credit Card", status: "failed", date: "Apr 05, 2024" },
]

export default function PaymentsPage() {
  useAuth({ required: true })

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="payments" />
      <Topbar />
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[13px] font-medium text-[#fafafa]">Payments</h1>
          </div>

          {/* KPI Strip */}
          <section className="grid grid-cols-4 gap-3 mb-5">
            {paymentStats.map((stat) => (
              <div key={stat.label} className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4">
                <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">{stat.label}</span>
                <p className="text-[22px] font-semibold text-[#fafafa] leading-none tracking-tight mt-2">{stat.value}</p>
              </div>
            ))}
          </section>

          {/* Transaction Table */}
          <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
            {/* Table Header Bar */}
            <div className="px-4 py-2.5 border-b border-[#ffffff14] flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-[#fafafa]">Transactions</h2>
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
                  <Filter className="w-3 h-3" strokeWidth={1.5} />
                  <span>Filter</span>
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
                  <ArrowUpDown className="w-3 h-3" strokeWidth={1.5} />
                  <span>Sort</span>
                </button>
              </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[24px_1fr_1fr_100px_100px_86px_100px_32px] gap-3 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
              <div className="flex items-center justify-center">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer" />
              </div>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Transaction</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Client</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider text-right">Amount</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Method</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Status</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Date</span>
              <span></span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#ffffff08]">
              {transactions.map((txn) => {
                const status = statusConfig[txn.status]
                return (
                  <div
                    key={txn.id}
                    className="grid grid-cols-[24px_1fr_1fr_100px_100px_86px_100px_32px] gap-3 px-4 py-2.5 items-center hover:bg-[#ffffff05] transition-colors group"
                  >
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer" />
                    </div>
                    <span className="text-[12px] font-medium text-[#fafafa]">{txn.reference}</span>
                    <span className="text-[12px] text-[#a1a1aa]">{txn.client}</span>
                    <span className="text-[12px] text-[#fafafa] font-medium text-right">{txn.amount}</span>
                    <span className="text-[12px] text-[#71717a]">{txn.method}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text} w-fit`}>
                      {status.label}
                    </span>
                    <span className="text-[12px] text-[#71717a]">{txn.date}</span>
                    <button className="w-6 h-6 flex items-center justify-center rounded text-[#3f3f46] opacity-0 group-hover:opacity-100 hover:text-[#71717a] hover:bg-[#ffffff08] transition-all">
                      <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
