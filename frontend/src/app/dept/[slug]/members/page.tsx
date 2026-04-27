"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { PageTopbar } from "@/components/dashboard/page-topbar"
import { Search, X, Copy, Link2, ChevronDown } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  initials: string
  role: "admin" | "member" | "viewer"
  status: "active" | "invited"
}

const members: Member[] = [
  { id: "1", name: "John Doe", email: "john.doe@company.com", initials: "JD", role: "admin", status: "active" },
  { id: "2", name: "Sarah Chen", email: "sarah.chen@company.com", initials: "SC", role: "member", status: "active" },
  { id: "3", name: "Mike Wilson", email: "mike.wilson@company.com", initials: "MW", role: "member", status: "active" },
  { id: "4", name: "Emily Brown", email: "emily.brown@company.com", initials: "EB", role: "viewer", status: "active" },
  { id: "5", name: "Alex Turner", email: "alex.turner@company.com", initials: "AT", role: "member", status: "invited" },
  { id: "6", name: "Lisa Park", email: "lisa.park@company.com", initials: "LP", role: "viewer", status: "invited" },
]

const roleConfig = {
  admin: { label: "Admin", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  member: { label: "Member", bg: "bg-[#52525b]/20", text: "text-[#a1a1aa]" },
  viewer: { label: "Viewer", bg: "bg-[#3f3f46]/20", text: "text-[#71717a]" },
}

const statusConfig = {
  active: { label: "Active", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
  invited: { label: "Invited", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
}

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "member" | "viewer">("member")
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [expiryDropdownOpen, setExpiryDropdownOpen] = useState(false)
  const [selectedExpiry, setSelectedExpiry] = useState("7 days")
  const [copied, setCopied] = useState(false)

  const inviteLink = "https://invoicemate.app/invite/abc123xyz"

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="clients" />
      <PageTopbar breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Departments", href: "/dept" },
        { label: "Finance" },
        { label: "Members" },
      ]} />

      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-[16px] font-semibold text-[#fafafa]">Department Members</h1>
            <p className="text-[11px] text-[#52525b] mt-0.5">{members.length} members</p>
          </div>

          {/* Section 1: Add Member */}
          <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4 mb-4">
            <h2 className="text-[12px] font-medium text-[#a1a1aa] mb-3">Add Member</h2>
            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-9 pr-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              {/* Role Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="h-8 px-3 flex items-center gap-2 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#a1a1aa] hover:border-[#3f3f46] transition-colors"
                >
                  <span className="capitalize">{selectedRole}</span>
                  <ChevronDown className="w-3 h-3 text-[#52525b]" strokeWidth={1.5} />
                </button>
                {roleDropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 w-[120px] bg-[#18181b] border border-[#ffffff14] rounded-md py-1 z-20">
                    {(["admin", "member", "viewer"] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => { setSelectedRole(role); setRoleDropdownOpen(false) }}
                        className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#ffffff08] transition-colors capitalize ${
                          selectedRole === role ? "text-[#3b82f6]" : "text-[#a1a1aa]"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <button className="h-8 px-4 bg-[#3b82f6] text-white text-[12px] font-medium rounded-md hover:bg-[#2563eb] transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Section 2: Member List */}
          <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden mb-4">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_180px_80px_80px_60px] gap-4 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Name</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Email</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Role</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Status</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider"></span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#ffffff08]">
              {members.map((member) => {
                const role = roleConfig[member.role]
                const status = statusConfig[member.status]
                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-[1fr_180px_80px_80px_60px] gap-4 px-4 items-center h-10 hover:bg-[#ffffff05] transition-colors"
                  >
                    {/* Name + Avatar */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#27272a] flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-medium text-[#a1a1aa]">{member.initials}</span>
                      </div>
                      <span className="text-[12px] font-medium text-[#fafafa] truncate">{member.name}</span>
                    </div>

                    {/* Email */}
                    <span className="text-[11px] text-[#52525b] truncate">{member.email}</span>

                    {/* Role */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${role.bg} ${role.text} w-fit`}>
                      {role.label}
                    </span>

                    {/* Status */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text} w-fit`}>
                      {status.label}
                    </span>

                    {/* Actions */}
                    <button className="w-6 h-6 flex items-center justify-center rounded text-[#3f3f46] hover:text-[#ef4444] hover:bg-[#ffffff08] transition-colors">
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 3: Invite Section */}
          <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4">
            <h2 className="text-[12px] font-medium text-[#a1a1aa] mb-3">Invite Link</h2>
            <div className="flex items-center gap-3">
              {/* Link Display */}
              <div className="flex-1 flex items-center gap-2 h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md">
                <Link2 className="w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
                <span className="text-[12px] text-[#71717a] truncate">{inviteLink}</span>
              </div>

              {/* Expiry Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setExpiryDropdownOpen(!expiryDropdownOpen)}
                  className="h-8 px-3 flex items-center gap-2 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#a1a1aa] hover:border-[#3f3f46] transition-colors"
                >
                  <span>Expires: {selectedExpiry}</span>
                  <ChevronDown className="w-3 h-3 text-[#52525b]" strokeWidth={1.5} />
                </button>
                {expiryDropdownOpen && (
                  <div className="absolute top-full mt-1 right-0 w-[140px] bg-[#18181b] border border-[#ffffff14] rounded-md py-1 z-20">
                    {["1 day", "7 days", "30 days", "Never"].map((expiry) => (
                      <button
                        key={expiry}
                        onClick={() => { setSelectedExpiry(expiry); setExpiryDropdownOpen(false) }}
                        className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#ffffff08] transition-colors ${
                          selectedExpiry === expiry ? "text-[#3b82f6]" : "text-[#a1a1aa]"
                        }`}
                      >
                        {expiry}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="h-8 px-4 flex items-center gap-2 bg-[#27272a] border border-[#ffffff14] text-[12px] font-medium text-[#a1a1aa] rounded-md hover:bg-[#3f3f46] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
