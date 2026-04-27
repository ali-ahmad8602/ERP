"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { useAuth } from "@/hooks/useAuth"
import { FileText, Filter, ArrowUpDown, MoreHorizontal, Plus } from "lucide-react"

const invoiceStats = [
  { label: "TOTAL INVOICES", value: "847" },
  { label: "PAID", value: "623" },
  { label: "PENDING", value: "156" },
  { label: "OVERDUE", value: "68" },
]

const statusConfig = {
  paid: { label: "Paid", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
  pending: { label: "Pending", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  overdue: { label: "Overdue", bg: "bg-[#ef4444]/15", text: "text-[#ef4444]" },
  draft: { label: "Draft", bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
} as const

type InvoiceStatus = keyof typeof statusConfig

interface Invoice {
  id: string
  number: string
  client: string
  amount: string
  status: InvoiceStatus
  dueDate: string
}

const invoices: Invoice[] = [
  { id: "1", number: "INV-2024-0847", client: "Acme Corp", amount: "$12,500.00", status: "paid", dueDate: "Mar 15, 2024" },
  { id: "2", number: "INV-2024-0846", client: "TechFlow Inc", amount: "$8,200.00", status: "pending", dueDate: "Apr 02, 2024" },
  { id: "3", number: "INV-2024-0845", client: "Global Solutions", amount: "$24,800.00", status: "overdue", dueDate: "Feb 28, 2024" },
  { id: "4", number: "INV-2024-0844", client: "Nexus Digital", amount: "$5,400.00", status: "paid", dueDate: "Mar 10, 2024" },
  { id: "5", number: "INV-2024-0843", client: "Sterling & Co", amount: "$18,750.00", status: "draft", dueDate: "Apr 15, 2024" },
  { id: "6", number: "INV-2024-0842", client: "Vertex Labs", amount: "$31,200.00", status: "paid", dueDate: "Mar 05, 2024" },
  { id: "7", number: "INV-2024-0841", client: "Pinnacle Group", amount: "$9,600.00", status: "pending", dueDate: "Apr 08, 2024" },
  { id: "8", number: "INV-2024-0840", client: "Horizon Media", amount: "$14,300.00", status: "overdue", dueDate: "Feb 20, 2024" },
]

export default function InvoicesPage() {
  useAuth({ required: true })

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="invoices" />
      <Topbar />
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[13px] font-medium text-[#fafafa]">Invoices</h1>
            <button className="flex items-center gap-1.5 h-7 px-3 bg-[#3b82f6] hover:bg-[#2563eb] text-[11px] font-medium text-white rounded-md transition-colors">
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Create Invoice</span>
            </button>
          </div>

          {/* KPI Strip */}
          <section className="grid grid-cols-4 gap-3 mb-5">
            {invoiceStats.map((stat) => (
              <div key={stat.label} className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4">
                <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">{stat.label}</span>
                <p className="text-[22px] font-semibold text-[#fafafa] leading-none tracking-tight mt-2">{stat.value}</p>
              </div>
            ))}
          </section>

          {/* Invoice Table */}
          <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
            {/* Table Header Bar */}
            <div className="px-4 py-2.5 border-b border-[#ffffff14] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#3f3f46]" strokeWidth={1.5} />
                <h2 className="text-[13px] font-medium text-[#fafafa]">All Invoices</h2>
              </div>
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
            <div className="grid grid-cols-[24px_1fr_1fr_100px_86px_100px_32px] gap-3 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
              <div className="flex items-center justify-center">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer" />
              </div>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Invoice #</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Client</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider text-right">Amount</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Status</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Due Date</span>
              <span></span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#ffffff08]">
              {invoices.map((inv) => {
                const status = statusConfig[inv.status]
                return (
                  <div
                    key={inv.id}
                    className="grid grid-cols-[24px_1fr_1fr_100px_86px_100px_32px] gap-3 px-4 py-2.5 items-center hover:bg-[#ffffff05] transition-colors group"
                  >
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer" />
                    </div>
                    <span className="text-[12px] font-medium text-[#fafafa]">{inv.number}</span>
                    <span className="text-[12px] text-[#a1a1aa]">{inv.client}</span>
                    <span className="text-[12px] text-[#fafafa] font-medium text-right">{inv.amount}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text} w-fit`}>
                      {status.label}
                    </span>
                    <span className="text-[12px] text-[#71717a]">{inv.dueDate}</span>
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
