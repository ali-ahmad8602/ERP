"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { PageTopbar } from "@/components/dashboard/page-topbar"
import { Eye, EyeOff, Send, RotateCcw, X, Users, Building2, CreditCard, ChevronDown, ShieldOff, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useAuthStore } from "@/store/auth.store"
import { usePermissions } from "@/hooks/usePermissions"
import { useToast } from "@/components/ui/action-toast"
import { inviteApi, deptApi, usersApi } from "@/lib/api"

type TabType = "profile" | "invites" | "organization" | "users"

interface InviteRecord {
  _id: string
  email: string
  orgRole: string
  status: string
}

const roleConfig: Record<string, { label: string; bg: string; text: string }> = {
  admin: { label: "Admin", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  member: { label: "Member", bg: "bg-[#52525b]/20", text: "text-[#a1a1aa]" },
  viewer: { label: "Viewer", bg: "bg-[#3f3f46]/20", text: "text-[#71717a]" },
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  accepted: { label: "Accepted", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
}

export default function SettingsPage() {
  const { user } = useAuth({ required: true })
  const authUser = useAuthStore((s) => s.user)
  const { canManageUsers } = usePermissions()
  const { show } = useToast()

  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"admin" | "member" | "viewer">("member")

  // Profile state
  const [profileName, setProfileName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Invites state
  const [invites, setInvites] = useState<InviteRecord[]>([])
  const [invitesLoading, setInvitesLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [sendingInvite, setSendingInvite] = useState(false)

  // Organization state
  const [departments, setDepartments] = useState<any[]>([])
  const [orgLoading, setOrgLoading] = useState(false)

  // Users state
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [actioningUserId, setActioningUserId] = useState<string | null>(null)

  // Sync profile name from auth store
  useEffect(() => {
    if (authUser?.name && !profileName) {
      setProfileName(authUser.name)
    }
  }, [authUser?.name, profileName])

  // Fetch invites when tab switches to invites
  useEffect(() => {
    if (activeTab === "invites") {
      setInvitesLoading(true)
      inviteApi.list()
        .then((res) => setInvites(res.invites ?? []))
        .catch(() => {})
        .finally(() => setInvitesLoading(false))
    }
  }, [activeTab])

  // Fetch departments when tab switches to organization
  useEffect(() => {
    if (activeTab === "organization") {
      setOrgLoading(true)
      deptApi.list()
        .then((res) => setDepartments(res.departments ?? []))
        .catch(() => {})
        .finally(() => setOrgLoading(false))
    }
  }, [activeTab])

  // Fetch users when tab switches to users
  useEffect(() => {
    if (activeTab === "users") {
      setUsersLoading(true)
      usersApi.list()
        .then((res) => setAllUsers(res.users ?? []))
        .catch(() => {})
        .finally(() => setUsersLoading(false))
    }
  }, [activeTab])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMessage("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: profileName }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaveMessage("Saved!")
      setTimeout(() => setSaveMessage(""), 2000)
    } catch {
      setSaveMessage("Could not save profile")
      setTimeout(() => setSaveMessage(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return
    setSendingInvite(true)
    try {
      await inviteApi.create({ email: inviteEmail.trim(), orgRole: selectedRole })
      setInviteEmail("")
      // Refresh invites
      const res = await inviteApi.list()
      setInvites(res.invites ?? [])
    } catch {
      // silently handle
    } finally {
      setSendingInvite(false)
    }
  }

  const handleDeleteInvite = async (id: string) => {
    try {
      await inviteApi.delete(id)
      setInvites((prev) => prev.filter((inv) => inv._id !== id))
    } catch {
      // silently handle
    }
  }

  const handleDeactivateUser = async (userId: string, userName: string) => {
    if (userId === authUser?._id) {
      show("You cannot deactivate your own account", "error")
      return
    }
    if (!window.confirm(`Deactivate ${userName}? They will no longer be able to access the workspace.`)) return
    setActioningUserId(userId)
    try {
      await usersApi.deactivate(userId)
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: false } : u))
      show(`${userName} has been deactivated`)
    } catch (err: any) {
      show(err.message || "Failed to deactivate user", "error")
    } finally {
      setActioningUserId(null)
    }
  }

  const handleActivateUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Activate ${userName}? They will regain access to the workspace.`)) return
    setActioningUserId(userId)
    try {
      await usersApi.activate(userId)
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: true } : u))
      show(`${userName} has been activated`)
    } catch (err: any) {
      show(err.message || "Failed to activate user", "error")
    } finally {
      setActioningUserId(null)
    }
  }

  const allTabs: { id: TabType; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "users", label: "Users" },
    { id: "invites", label: "Invites" },
    { id: "organization", label: "Organization" },
  ]

  const tabs = allTabs.filter((tab) => {
    if (tab.id === "invites" || tab.id === "organization" || tab.id === "users") return canManageUsers
    return true
  })

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
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
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
                    value={authUser?.email ?? ""}
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
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="h-8 px-4 bg-[#3b82f6] text-white text-[12px] font-medium rounded-md hover:bg-[#2563eb] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  {saveMessage && (
                    <span className="text-[11px] text-[#a1a1aa]">{saveMessage}</span>
                  )}
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
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
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

                  <button
                    onClick={handleSendInvite}
                    disabled={sendingInvite || !inviteEmail.trim()}
                    className="h-8 px-4 flex items-center gap-2 bg-[#3b82f6] text-white text-[12px] font-medium rounded-md hover:bg-[#2563eb] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{sendingInvite ? "Sending..." : "Send"}</span>
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
                  {invitesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-[1fr_80px_80px_100px] gap-4 px-4 items-center h-10 animate-pulse">
                        <div className="h-3 w-40 bg-[#27272a] rounded" />
                        <div className="h-3 w-12 bg-[#27272a] rounded" />
                        <div className="h-3 w-12 bg-[#27272a] rounded" />
                        <div className="h-3 w-6 bg-[#27272a] rounded" />
                      </div>
                    ))
                  ) : invites.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[12px] text-[#52525b]">No invites yet</div>
                  ) : (
                    invites.map((invite) => {
                      const role = roleConfig[invite.orgRole] ?? roleConfig.member
                      const status = statusConfig[invite.status] ?? statusConfig.pending
                      return (
                        <div
                          key={invite._id}
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
                            <button
                              onClick={() => handleDeleteInvite(invite._id)}
                              className="w-6 h-6 flex items-center justify-center rounded text-[#52525b] hover:text-[#ef4444] hover:bg-[#ffffff08] transition-colors"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === "organization" && (
            <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-5">
              {orgLoading ? (
                <div className="grid grid-cols-2 gap-6 max-w-[640px] animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#27272a]" />
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-16 bg-[#27272a] rounded" />
                        <div className="h-3 w-24 bg-[#27272a] rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 max-w-[640px]">
                  {/* Org Name */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#27272a] flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-[#71717a]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider mb-0.5">Organization</p>
                      <p className="text-[13px] font-medium text-[#fafafa]">{authUser?.name ?? "Organization"}</p>
                    </div>
                  </div>

                  {/* Workspace ID */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#27272a] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-medium text-[#71717a]">ID</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider mb-0.5">Workspace ID</p>
                      <p className="text-[13px] font-mono text-[#a1a1aa]">{authUser?._id ?? "—"}</p>
                    </div>
                  </div>

                  {/* Department Count */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#27272a] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-[#71717a]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider mb-0.5">Departments</p>
                      <p className="text-[13px] font-medium text-[#fafafa]">{departments.length} department{departments.length !== 1 ? "s" : ""}</p>
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

                  {/* Department List */}
                  {departments.length > 0 && (
                    <div className="col-span-2 mt-4 border-t border-[#ffffff14] pt-4">
                      <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider mb-3">Departments</p>
                      <div className="space-y-2">
                        {departments.map((dept: any) => (
                          <div key={dept._id} className="flex items-center gap-2">
                            <span className="text-[16px]">{dept.icon || "📁"}</span>
                            <span className="text-[12px] font-medium text-[#fafafa]">{dept.name}</span>
                            <span className="text-[11px] text-[#52525b] ml-auto">{dept.slug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_160px_100px_80px_100px] gap-3 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
                <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Name</span>
                <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Email</span>
                <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Role</span>
                <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Status</span>
                <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Actions</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-[#ffffff08]">
                {usersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-[1fr_160px_100px_80px_100px] gap-3 px-4 items-center h-11 animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#27272a]" />
                        <div className="h-3 w-24 bg-[#27272a] rounded" />
                      </div>
                      <div className="h-3 w-32 bg-[#27272a] rounded" />
                      <div className="h-4 w-14 bg-[#27272a] rounded-full" />
                      <div className="h-4 w-12 bg-[#27272a] rounded-full" />
                      <div className="h-6 w-20 bg-[#27272a] rounded" />
                    </div>
                  ))
                ) : allUsers.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Users className="w-6 h-6 text-[#3f3f46] mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-[12px] text-[#52525b]">No users found</p>
                  </div>
                ) : (
                  allUsers.map((u) => {
                    const isActive = u.isActive !== false
                    const isSelf = u._id === authUser?._id
                    const initials = (u.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                    const orgRoleLabel = (u.orgRole || "user").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())

                    const orgRoleStyle = (() => {
                      const r = u.orgRole || "user"
                      if (r === "super_admin" || r === "org_admin") return "bg-[#3b82f6]/15 text-[#3b82f6]"
                      if (r === "top_management") return "bg-[#8b5cf6]/15 text-[#8b5cf6]"
                      return "bg-[#52525b]/20 text-[#a1a1aa]"
                    })()

                    return (
                      <div
                        key={u._id}
                        className="grid grid-cols-[1fr_160px_100px_80px_100px] gap-3 px-4 items-center h-11 hover:bg-[#ffffff05] transition-colors"
                      >
                        {/* Name + Avatar */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-[#27272a] flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-medium text-[#a1a1aa]">{initials}</span>
                          </div>
                          <span className="text-[12px] font-medium text-[#fafafa] truncate">
                            {u.name || "Unknown"}
                            {isSelf && <span className="text-[10px] text-[#52525b] ml-1.5">(you)</span>}
                          </span>
                        </div>

                        {/* Email */}
                        <span className="text-[12px] text-[#71717a] truncate">{u.email || "—"}</span>

                        {/* Role */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${orgRoleStyle}`}>
                          {orgRoleLabel}
                        </span>

                        {/* Status */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${
                          isActive ? "bg-[#22c55e]/15 text-[#22c55e]" : "bg-[#ef4444]/15 text-[#ef4444]"
                        }`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>

                        {/* Actions */}
                        <div>
                          {canManageUsers && !isSelf && (
                            isActive ? (
                              <button
                                onClick={() => handleDeactivateUser(u._id, u.name)}
                                disabled={actioningUserId === u._id}
                                className="h-6 px-2 flex items-center gap-1 rounded bg-[#27272a] text-[10px] font-medium text-[#ef4444] hover:bg-[#ef4444]/15 transition-colors disabled:opacity-50"
                              >
                                <ShieldOff className="w-3 h-3" strokeWidth={1.5} />
                                {actioningUserId === u._id ? "..." : "Deactivate"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(u._id, u.name)}
                                disabled={actioningUserId === u._id}
                                className="h-6 px-2 flex items-center gap-1 rounded bg-[#27272a] text-[10px] font-medium text-[#22c55e] hover:bg-[#22c55e]/15 transition-colors disabled:opacity-50"
                              >
                                <ShieldCheck className="w-3 h-3" strokeWidth={1.5} />
                                {actioningUserId === u._id ? "..." : "Activate"}
                              </button>
                            )
                          )}
                          {isSelf && (
                            <span className="text-[10px] text-[#3f3f46]">—</span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
