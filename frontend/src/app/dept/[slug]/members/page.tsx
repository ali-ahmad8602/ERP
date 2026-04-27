"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { PageTopbar } from "@/components/dashboard/page-topbar"
import { Search, X, Copy, Link2, ChevronDown } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/store/auth.store"
import { deptApi, usersApi } from "@/lib/api"
import type { Department, User } from "@/types"

const roleConfig = {
  admin: { label: "Admin", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  member: { label: "Member", bg: "bg-[#52525b]/20", text: "text-[#a1a1aa]" },
  viewer: { label: "Viewer", bg: "bg-[#3f3f46]/20", text: "text-[#71717a]" },
  head: { label: "Head", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
}

const statusConfig = {
  active: { label: "Active", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
  invited: { label: "Invited", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
}

interface DisplayMember {
  id: string
  name: string
  email: string
  initials: string
  role: "admin" | "member" | "viewer" | "head"
  status: "active" | "invited"
}

export default function MembersPage() {
  useAuth({ required: true })
  const params = useParams()
  const slug = params?.slug as string
  const { canManageUsers } = usePermissions()
  const authUser = useAuthStore((s) => s.user)

  const [dept, setDept] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedRole, setSelectedRole] = useState<"admin" | "member" | "viewer">("member")
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [expiryDropdownOpen, setExpiryDropdownOpen] = useState(false)
  const [selectedExpiry, setSelectedExpiry] = useState("7 days")
  const [copied, setCopied] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/invite/${slug}` : ""

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Fetch department by slug
  useEffect(() => {
    if (!slug) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await deptApi.list()
        const found = (res.departments ?? []).find((d: any) => d.slug === slug)
        if (found && !cancelled) {
          const detailRes = await deptApi.get(found._id)
          if (!cancelled) setDept(detailRes.department)
        }
      } catch {
        // silently handle
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  // Debounced user search — depends ONLY on primitives
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([])
      setSelectedUserId(null)
      return
    }
    const timer = setTimeout(() => {
      // Use current dept member IDs to filter results at render time, not here
      usersApi.search(searchQuery.trim())
        .then((res) => setSearchResults(res.users ?? []))
        .catch(() => setSearchResults([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, slug])

  // Compute allMembers with useMemo keyed on dept
  const allMembers: DisplayMember[] = useMemo(() => {
    if (!dept) return []
    const heads = (dept.heads ?? []).map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      initials: u.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
      role: "head" as const,
      status: "active" as const,
    }))
    const members = (dept.members ?? []).map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      initials: u.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
      role: "member" as const,
      status: "active" as const,
    }))
    // Deduplicate by id (heads might also be in members)
    const map = new Map<string, DisplayMember>()
    heads.forEach((h) => map.set(h.id, h))
    members.forEach((m) => { if (!map.has(m.id)) map.set(m.id, m) })
    return Array.from(map.values())
  }, [dept])

  // Check if user is a dept head
  const isDeptHead = useMemo(() => {
    if (!dept || !authUser) return false
    return (dept.heads ?? []).some((h) => h._id === authUser._id)
  }, [dept, authUser])

  const canAddMember = canManageUsers || isDeptHead

  // Filter search results to exclude existing members
  const filteredSearchResults = useMemo(() => {
    const memberIds = new Set(allMembers.map((m) => m.id))
    return searchResults.filter((u) => !memberIds.has(u._id))
  }, [searchResults, allMembers])

  const handleAddMember = useCallback(async () => {
    if (!dept || !selectedUserId) return
    setAdding(true)
    try {
      await deptApi.addMember(dept._id, selectedUserId, selectedRole)
      // Refresh dept
      const detailRes = await deptApi.get(dept._id)
      setDept(detailRes.department)
      setSearchQuery("")
      setSearchResults([])
      setSelectedUserId(null)
    } catch {
      // silently handle
    } finally {
      setAdding(false)
    }
  }, [dept, selectedUserId, selectedRole])

  const handleRemoveMember = useCallback(async (userId: string) => {
    if (!dept) return
    const member = allMembers.find((m) => m.id === userId)
    const confirmed = window.confirm(`Remove ${member?.name ?? "this member"} from this department?`)
    if (!confirmed) return
    try {
      await deptApi.removeMember(dept._id, userId)
      const detailRes = await deptApi.get(dept._id)
      setDept(detailRes.department)
    } catch {
      // silently handle
    }
  }, [dept, allMembers])

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="clients" />
      <PageTopbar breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Departments", href: "/dept" },
        { label: dept?.name ?? slug ?? "" },
        { label: "Members" },
      ]} />

      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-[16px] font-semibold text-[#fafafa]">Department Members</h1>
            <p className="text-[11px] text-[#52525b] mt-0.5">{loading ? "Loading..." : `${allMembers.length} members`}</p>
          </div>

          {/* Section 1: Add Member */}
          {canAddMember && (
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
                    onChange={(e) => { setSearchQuery(e.target.value); setSelectedUserId(null) }}
                    className="w-full h-8 pl-9 pr-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
                  />
                  {/* Search Dropdown */}
                  {filteredSearchResults.length > 0 && !selectedUserId && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-[#18181b] border border-[#ffffff14] rounded-md py-1 z-20 max-h-[200px] overflow-y-auto">
                      {filteredSearchResults.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => { setSelectedUserId(user._id); setSearchQuery(user.name); setSearchResults([]) }}
                          className="w-full px-3 py-1.5 text-left hover:bg-[#ffffff08] transition-colors flex items-center gap-2"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#27272a] flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-medium text-[#a1a1aa]">
                              {user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[12px] text-[#fafafa]">{user.name}</span>
                            <span className="text-[10px] text-[#52525b] ml-2">{user.email}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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
                <button
                  onClick={handleAddMember}
                  disabled={adding || !selectedUserId}
                  className="h-8 px-4 bg-[#3b82f6] text-white text-[12px] font-medium rounded-md hover:bg-[#2563eb] transition-colors disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          )}

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
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[1fr_180px_80px_80px_60px] gap-4 px-4 items-center h-10 animate-pulse">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#27272a]" />
                      <div className="h-3 w-24 bg-[#27272a] rounded" />
                    </div>
                    <div className="h-3 w-32 bg-[#27272a] rounded" />
                    <div className="h-3 w-12 bg-[#27272a] rounded" />
                    <div className="h-3 w-12 bg-[#27272a] rounded" />
                    <div className="h-3.5 w-3.5 bg-[#27272a] rounded" />
                  </div>
                ))
              ) : allMembers.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[12px] text-[#52525b]">No members yet. Add team members to get started.</p>
                </div>
              ) : (
                allMembers.map((member) => {
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
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="w-6 h-6 flex items-center justify-center rounded text-[#3f3f46] hover:text-[#ef4444] hover:bg-[#ffffff08] transition-colors"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  )
                })
              )}
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
