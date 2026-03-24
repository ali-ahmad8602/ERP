"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2, Search, Loader2, Crown, User } from "lucide-react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { useDeptStore } from "@/store/dept.store";
import { usersApi, deptApi } from "@/lib/api";
import type { User as UserType, Department } from "@/types";

const ROLE_CONFIG = {
  dept_head: { label: "Head",   color: "#F5A623", bg: "rgba(245,166,35,0.1)",   icon: <Crown size={10} /> },
  member:    { label: "Member", color: "#888888", bg: "rgba(136,136,136,0.08)", icon: <User size={10} /> },
  guest:     { label: "Guest",  color: "#444444", bg: "rgba(68,68,68,0.1)",     icon: <User size={10} /> },
};

export default function DeptMembersPage() {
  const { slug } = useParams<{ slug: string }>();
  const { departments, addMember, removeMember } = useDeptStore();
  const dept = departments.find((d: Department) => d.slug === slug) as Department | undefined;

  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [searching, setSearching]       = useState(false);
  const [selectedRole, setSelectedRole] = useState<"dept_head" | "member" | "guest">("member");
  const [adding, setAdding]             = useState(false);
  const [removing, setRemoving]         = useState<string | null>(null);
  const [error, setError]               = useState("");

  const allMembers: UserType[] = dept ? [...(dept.heads ?? []), ...(dept.members ?? []).filter(m => !(dept.heads ?? []).some(h => h._id === m._id))] : [];

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { users } = await usersApi.search(searchQuery);
        setSearchResults(users.filter(u => !allMembers.some(m => m._id === u._id)));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, allMembers]);

  const handleAdd = async (user: UserType) => {
    if (!dept || adding) return;
    setAdding(true); setError("");
    try {
      await addMember(dept._id, user._id, selectedRole);
      setSearchQuery(""); setSearchResults([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally { setAdding(false); }
  };

  const handleRemove = async (userId: string) => {
    if (!dept || removing) return;
    setRemoving(userId);
    try { await removeMember(dept._id, userId); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to remove member"); }
    finally { setRemoving(null); }
  };

  const getMemberRole = (userId: string): keyof typeof ROLE_CONFIG => {
    if (dept?.heads?.some(h => h._id === userId)) return "dept_head";
    return "member";
  };

  if (!dept) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 14, color: "#555" }}>Department not found</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#080808" }}>
      <Topbar department={dept} title="Members" />

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", maxWidth: 760 }}>

        {/* Back */}
        <Link href={`/dept/${slug}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "#555", textDecoration: "none", marginBottom: 24,
          transition: "color 0.1s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#888")}
          onMouseLeave={e => (e.currentTarget.style.color = "#555")}
        >
          <ArrowLeft size={13} /> Back to {dept.name}
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#F3F3F3", letterSpacing: "-0.02em" }}>Members</h1>
            <p style={{ fontSize: 13, color: "#555", marginTop: 3 }}>
              {allMembers.length} {allMembers.length === 1 ? "person" : "people"} in {dept.name}
            </p>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: "9px 14px", borderRadius: 8, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", fontSize: 12, color: "#FF4444" }}>
            {error}
          </div>
        )}

        {/* Add member section */}
        <div style={{ marginBottom: 28, padding: 18, background: "#0F0F0F", borderRadius: 12, border: "1px solid #1E1E1E" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Add Member
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={13} color="#444" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: "100%", background: "#111", border: "1px solid #222",
                  borderRadius: 9, padding: "9px 12px 9px 34px", fontSize: 13,
                  color: "#F3F3F3", outline: "none", boxSizing: "border-box",
                }}
                className="input-field"
              />
              {searching && (
                <Loader2 size={13} color="#555" className="animate-spin" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
              )}
            </div>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as typeof selectedRole)}
              style={{
                background: "#111", border: "1px solid #222", borderRadius: 9,
                padding: "9px 12px", fontSize: 13, color: "#888", outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="member">Member</option>
              <option value="dept_head">Head</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div style={{ marginTop: 8, background: "#111", border: "1px solid #222", borderRadius: 9, overflow: "hidden" }}>
              {searchResults.map(user => (
                <button key={user._id} onClick={() => handleAdd(user)} disabled={adding} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", background: "transparent", border: "none",
                  borderBottom: "1px solid #1A1A1A", cursor: "pointer", textAlign: "left",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#161616")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: `hsl(${(user.name.charCodeAt(0) * 37) % 360}, 50%, 30%)`,
                    fontSize: 12, fontWeight: 700, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#C8C8C8", fontWeight: 500 }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "#555" }}>{user.email}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <UserPlus size={13} color="#0454FC" />
                    <span style={{ fontSize: 12, color: "#0454FC" }}>Add</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <p style={{ fontSize: 12, color: "#444", marginTop: 8, paddingLeft: 2 }}>No users found matching &ldquo;{searchQuery}&rdquo;</p>
          )}
        </div>

        {/* Members list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allMembers.length === 0 && (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#444" }}>No members yet</p>
              <p style={{ fontSize: 12, color: "#333", marginTop: 4 }}>Search above to add the first member</p>
            </div>
          )}
          {allMembers.map(member => {
            const role = getMemberRole(member._id);
            const rc   = ROLE_CONFIG[role];
            return (
              <div key={member._id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", background: "#0F0F0F",
                borderRadius: 11, border: "1px solid #1A1A1A",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `hsl(${(member.name.charCodeAt(0) * 37) % 360}, 50%, 30%)`,
                  fontSize: 13, fontWeight: 700, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {member.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, color: "#C8C8C8", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#555" }}>{member.email}</div>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 9px", borderRadius: 6,
                  background: rc.bg, color: rc.color, fontSize: 11, fontWeight: 500,
                }}>
                  {rc.icon}{rc.label}
                </span>
                <span style={{
                  fontSize: 10, color: "#444", background: "#1A1A1A",
                  padding: "2px 6px", borderRadius: 4,
                }}>
                  {member.orgRole.replace("_", " ")}
                </span>
                <button onClick={() => handleRemove(member._id)} disabled={removing === member._id} style={{
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "#444",
                  transition: "all 0.1s", flexShrink: 0,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,68,68,0.1)"; e.currentTarget.style.color = "#FF4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
                >
                  {removing === member._id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
