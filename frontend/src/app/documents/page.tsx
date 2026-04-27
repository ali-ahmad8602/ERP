"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { useAuth } from "@/hooks/useAuth"
import { FolderOpen } from "lucide-react"

export default function DocumentsPage() {
  useAuth({ required: true })

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="documents" />
      <Topbar />
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[13px] font-medium text-[#fafafa]">Documents</h1>
          </div>

          {/* Empty State */}
          <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="w-8 h-8 text-[#3f3f46] mb-3" strokeWidth={1.5} />
              <h3 className="text-[13px] font-medium text-[#fafafa] mb-1">Module coming soon</h3>
              <p className="text-[11px] text-[#52525b] max-w-[280px]">
                The Documents module is under development and will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
