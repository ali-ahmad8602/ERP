"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { PageTopbar } from "@/components/dashboard/page-topbar"
import { Eye, EyeOff, Send, RotateCcw, X, Users, Building2, CreditCard, ChevronDown } from "lucide-react"

type TabType = "profile" | "invites" | "organization"

interface Invite {
  id: string
  email: string
  role: "admin" | "member" | "viewer"
  status: "pending" | "accepted"
}

const invites: Invite[] = [
  { id: "1", email: "alex.turner@company.com", role: "member", status: "pending" },
  { id: "2", email: "lisa.park@company.com", role: "viewer", status: "pending" },
  { id: "3", email: "james.white@company.com", role: "admin", status: "accepted" },
  { id: "4", email: "nina.patel@company.com", role: "member", status: "accepted" },
]

const roleConfig = {
  admin: { label: "Admin", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  member: { label: "Member", bg: "bg-[#52525b]/20", text: "text-[#a1a1aa]" },
  viewer: { label: "Viewer", bg: "bg-[#3f3f46]/20", text: "text-[#71717a]" },
}

const statusConfig = {
  pending: { label: "Pending", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  accepted: { label: "Accepted", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"admin" | "member" | "viewer">("member")

  const tabs: { id: TabType; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "invites", label: "Invites" },
    { id: "organization", label: "Organization" },
  ]

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="settings" />
      <PageTopbar breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Settings" },
      ]} />

      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-[16px] font-semibold text-[#fafafa]">Settings</h1>
            <p className="text-[11px] text-[#52525b] mt-0.5">Manage your account and workspace</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-5 border-b border-[#ffffff14]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-[12px] font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-[#fafafa]"
                    : "text-[#52525b] hover:text-[#a1a1aa]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3b82f6]" />
                )}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-5">
              <div className="max-w-[320px] space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-medium text-[#71717a] uppercase tracking-wider mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-medium text-[#71717a] uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value="john.doe@company.com"
                    readOnly
                    className="w-full h-8 px-3 bg-[#0a0a0b] border border-[#ffffff14] rounded-md text-[12px] text-[#52525b] cursor-not-allowed"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-[#ffffff14] pt-4">
                  <h3 className="text-[12px] font-medium text-[#a1a1aa] mb-3">Change Password</h3>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-[11px] font-medium text-[#71717a] uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="w-full h-8 px-3 pr-10 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#71717a]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-medium text-[#71717a] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="w-full h-8 px-3 pr-10 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#71717a]"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button className="h-8 px-4 bg-[#3b82f6] text-white text-[12px] font-medium rounded-md hover:bg-[#2563eb] transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invites Tab */}
          {activeTab === "invites" && (
            <div className="space-y-4">
              {/* Add Invite Form */}
              <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4">
                <h2 className="text-[12px] font-medium text-[#a1a1aa] mb-3">Send Invite</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="flex-1 max-w-[280px] h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
                  />

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

                  <button className="h-8 px-4 flex items-center gap-2 bg-[#3b82f6] text-white text-[12px] font-medium rounded-md hover:bg-[#2563eb] transition-colors">
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {/* Invites Table */}
              <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_80px_80px_100px] gap-4 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
                  <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Email</span>
                  <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Role</span>
                  <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Status</span>
                  <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Actions</span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-[#ffffff08]">
                  {invites.map((invite) => {
                    const role = roleConfig[invite.role]
                    const status = statusConfig[invite.status]
                    return (
                      <div
                        key={invite.id}
                        className="grid grid-cols-[1fr_80px_80px_100px] gap-4 px-4 items-center h-10 hover:bg-[#ffffff05] transition-colors"
                      >
                        <span className="text-[12px] text-[#a1a1aa] truncate">{invite.email}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${role.bg} ${role.text} w-fit`}>
                          {role.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text} w-fit`}>
                          {status.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {invite.status === "pending" && (
                            <button className="w-6 h-6 flex items-center justify-center rounded text-[#52525b] hover:text-[#3b82f6] hover:bg-[#ffffff08] transition-colors">
                              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          )}
                          <button className="w-6 h-6 flex items-center justify-center rounded text-[#52525b] hover:text-[#ef4444] hover:bg-[#ffffff08] transition-colors">
                            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === "organization" && (
            <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-5">
              <div className="grid grid-cols-2 gap-6 max-w-[640px]">
                {/* Org Name */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#27272a] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-[#71717a]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider mb-0.5">Organization</p>
                    <p className="text-[13px] font-medium text-[#fafafa]">Acme Corporation</p>
                  </div>
                </div>

                {/* Workspace ID */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#27272a] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-medium text-[#71717a]">ID</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider mb-0.5">Workspace ID</p>
                    <p className="text-[13px] font-mono text-[#a1a1aa]">ws_acme_123abc</p>
                  </div>
                </div>

                {/* Member Count */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#27272a] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#71717a]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider mb-0.5">Members</p>
                    <p className="text-[13px] font-medium text-[#fafafa]">24 members</p>
                  </div>
                </div>

                {/* Plan */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#27272a] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-[#71717a]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider mb-0.5">Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-[#fafafa]">Business</p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#3b82f6]/15 text-[#3b82f6]">PRO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
