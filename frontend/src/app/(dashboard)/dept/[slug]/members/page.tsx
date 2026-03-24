"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2, Search, Loader2, Crown, User } from "lucide-react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { useDeptStore } from "@/store/dept.store";
import { usersApi, deptApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { User as UserType, Department } from "@/types";

const ROLE_CONFIG = {
  dept_head: { label: "Head",   colorClass: "text-warning bg-warning/10",   icon: <Crown size={10} /> },
  member:    { label: "Member", colorClass: "text-text-secondary bg-bg-elevated", icon: <User size={10} /> },
  guest:     { label: "Guest",  colorClass: "text-text-muted bg-bg-elevated",     icon: <User size={10} /> },
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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-text-muted">Department not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-base">
      <Topbar department={dept} title="Members" />

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-[760px]">

        {/* Back */}
        <Link
          href={`/dept/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted no-underline mb-6 hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={13} /> Back to {dept.name}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Members</h1>
            <p className="text-[13px] text-text-muted mt-1">
              {allMembers.length} {allMembers.length === 1 ? "person" : "people"} in {dept.name}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">
            {error}
          </div>
        )}

        {/* Add member section */}
        <Card className="mb-7">
          <SectionLabel className="mb-3">Add Member</SectionLabel>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-8"
              />
              {searching && (
                <Loader2 size={13} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
              )}
            </div>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as typeof selectedRole)}
              className="bg-bg-surface border border-border rounded-btn px-3 py-2.5 text-[13px] text-text-secondary outline-none cursor-pointer"
            >
              <option value="member">Member</option>
              <option value="dept_head">Head</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-bg-surface border border-border rounded-btn overflow-hidden">
              {searchResults.map(user => (
                <button
                  key={user._id}
                  onClick={() => handleAdd(user)}
                  disabled={adding}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-transparent border-none border-b border-border-subtle cursor-pointer text-left hover:bg-bg-elevated transition-colors"
                >
                  <Avatar name={user.name} size="md" />
                  <div className="flex-1">
                    <div className="text-[13px] text-text-primary font-medium">{user.name}</div>
                    <div className="text-[11px] text-text-muted">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserPlus size={13} className="text-primary" />
                    <span className="text-xs text-primary">Add</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-xs text-text-muted mt-2 pl-0.5">No users found matching &ldquo;{searchQuery}&rdquo;</p>
          )}
        </Card>

        {/* Members list */}
        <div className="flex flex-col gap-1.5">
          {allMembers.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-text-muted">No members yet</p>
              <p className="text-xs text-text-muted mt-1">Search above to add the first member</p>
            </div>
          )}
          {allMembers.map(member => {
            const role = getMemberRole(member._id);
            const rc   = ROLE_CONFIG[role];
            return (
              <div
                key={member._id}
                className="flex items-center gap-3.5 px-4 py-3 bg-bg-surface rounded-[11px] border border-border-subtle hover:bg-bg-elevated transition-colors"
              >
                <Avatar name={member.name} size="lg" />
                <div className="flex-1 overflow-hidden">
                  <div className="text-[13px] text-text-primary font-medium truncate">
                    {member.name}
                  </div>
                  <div className="text-[11px] text-text-muted">{member.email}</div>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium",
                  rc.colorClass
                )}>
                  {rc.icon}{rc.label}
                </span>
                <span className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">
                  {member.orgRole.replace("_", " ")}
                </span>
                <button
                  onClick={() => handleRemove(member._id)}
                  disabled={removing === member._id}
                  className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] bg-transparent border-none cursor-pointer text-text-muted hover:bg-danger/10 hover:text-danger transition-all shrink-0"
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
