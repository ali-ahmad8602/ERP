"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { HelpCircle } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="help" />
      <Topbar />
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          <div className="flex flex-col items-center justify-center py-24">
            <HelpCircle className="w-10 h-10 text-[#3f3f46] mb-4" strokeWidth={1.5} />
            <h1 className="text-[18px] font-semibold text-[#fafafa] mb-1">Help & Support</h1>
            <p className="text-[13px] text-[#52525b]">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}
