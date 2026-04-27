"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { FileText, Filter, Search, Upload, Download, Trash2 } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedBy: string
  date: string
}

const documents: Document[] = [
  { id: "1", name: "Q4-Financial-Report.pdf", type: "Report", size: "2.4 MB", uploadedBy: "Sarah Mitchell", date: "Apr 12, 2024" },
  { id: "2", name: "Service-Agreement-AcmeCorp.pdf", type: "Contract", size: "1.1 MB", uploadedBy: "James Chen", date: "Apr 10, 2024" },
  { id: "3", name: "INV-2024-0847-Receipt.pdf", type: "Invoice", size: "340 KB", uploadedBy: "System", date: "Apr 09, 2024" },
  { id: "4", name: "Employee-Handbook-2024.pdf", type: "Policy", size: "4.8 MB", uploadedBy: "Laura Bennett", date: "Apr 07, 2024" },
  { id: "5", name: "Annual-Budget-Forecast.xlsx", type: "Report", size: "890 KB", uploadedBy: "Michael Okafor", date: "Apr 05, 2024" },
  { id: "6", name: "NDA-VertexLabs.pdf", type: "Contract", size: "520 KB", uploadedBy: "David Park", date: "Apr 03, 2024" },
  { id: "7", name: "Tax-Filing-2023.pdf", type: "Report", size: "3.2 MB", uploadedBy: "Sarah Mitchell", date: "Mar 28, 2024" },
  { id: "8", name: "Data-Privacy-Policy.pdf", type: "Policy", size: "1.7 MB", uploadedBy: "Rachel Thompson", date: "Mar 25, 2024" },
]

const typeConfig: Record<string, { bg: string; text: string }> = {
  Report: { bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  Contract: { bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
  Invoice: { bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  Policy: { bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
}

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="documents" />
      <Topbar />
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[13px] font-medium text-[#fafafa]">Documents</h1>
            <button className="flex items-center gap-1.5 h-7 px-3 bg-[#3b82f6] hover:bg-[#2563eb] text-[11px] font-medium text-white rounded-md transition-colors">
              <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Upload</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 mb-5">
            <button className="flex items-center gap-1.5 h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#ffffff20] transition-colors">
              <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Type</span>
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#ffffff20] transition-colors">
              <span>Date Range</span>
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full h-8 pl-9 pr-4 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20"
              />
            </div>
          </div>

          {/* Document Table */}
          <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
            {/* Column Headers */}
            <div className="grid grid-cols-[24px_1.4fr_80px_72px_1fr_100px_64px] gap-3 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
              <div className="flex items-center justify-center">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer" />
              </div>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Name</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Type</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider text-right">Size</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Uploaded By</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Date</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider text-right">Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#ffffff08]">
              {documents.map((doc) => {
                const typeStyle = typeConfig[doc.type] || typeConfig.Report
                return (
                  <div
                    key={doc.id}
                    className="grid grid-cols-[24px_1.4fr_80px_72px_1fr_100px_64px] gap-3 px-4 py-2.5 items-center hover:bg-[#ffffff05] transition-colors group"
                  >
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-[#3f3f46] flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-[12px] font-medium text-[#fafafa] truncate">{doc.name}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${typeStyle.bg} ${typeStyle.text} w-fit`}>
                      {doc.type}
                    </span>
                    <span className="text-[12px] text-[#71717a] text-right">{doc.size}</span>
                    <span className="text-[12px] text-[#a1a1aa]">{doc.uploadedBy}</span>
                    <span className="text-[12px] text-[#71717a]">{doc.date}</span>
                    <div className="flex items-center justify-end gap-0.5">
                      <button className="w-6 h-6 flex items-center justify-center rounded text-[#3f3f46] opacity-0 group-hover:opacity-100 hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-all">
                        <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                      <button className="w-6 h-6 flex items-center justify-center rounded text-[#3f3f46] opacity-0 group-hover:opacity-100 hover:text-[#ef4444] hover:bg-[#ffffff08] transition-all">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
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
