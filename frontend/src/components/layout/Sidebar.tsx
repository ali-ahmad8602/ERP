"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, BarChart3, Settings, LogOut, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { Department } from "@/types";

interface SidebarProps { departments: Department[]; userOrgRole: string; onAddDept?: () => void; }

export function Sidebar({ departments, userOrgRole, onAddDept }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [departments[0]?._id ?? ""]: true });
  const isAdmin = ["super_admin", "org_admin"].includes(userOrgRole);

  const handleLogout = () => { logout(); router.push("/login"); };
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <aside className="w-56 h-screen bg-bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-12 flex items-center px-4 shrink-0 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-text-primary tracking-tight">InvoiceMate</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" active={pathname === "/dashboard"} />
        <NavItem href={departments[0] ? `/dept/${departments[0].slug}` : "#"} icon={<Building2 size={15} />} label="Departments" active={pathname.startsWith("/dept/")} />
        <NavItem href="/reports" icon={<BarChart3 size={15} />} label="Reports" active={pathname === "/reports"} />
        <NavItem href="/settings/profile" icon={<Settings size={15} />} label="Settings" active={pathname.startsWith("/settings")} />

        {departments.length > 0 && (
          <div className="px-3 pt-6 pb-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Departments
          </div>
        )}

        {departments.map((dept) => {
          const isActive = pathname.startsWith(`/dept/${dept.slug}`);
          const isOpen = expanded[dept._id];
          const memberCount = dept.members?.length ?? 0;

          return (
            <div key={dept._id}>
              <button
                onClick={() => toggle(dept._id)}
                className={cn(
                  "w-full flex items-center gap-2 h-8 px-2.5 ml-1 rounded-md border-none cursor-pointer transition-colors duration-150 group text-left",
                  isActive ? "bg-bg-elevated text-text-primary" : "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                )}
              >
                <span className="w-4 shrink-0 text-center text-[13px]" style={{ color: dept.color || "var(--color-text-muted)" }}>{dept.icon}</span>
                <span className="flex-1 text-[13px] truncate">{dept.name}</span>
                {memberCount > 0 && <span className="text-[10px] text-text-muted tabular-nums">{memberCount}</span>}
                {isOpen ? <ChevronDown size={12} className="text-text-muted shrink-0" /> : <ChevronRight size={12} className="text-text-muted shrink-0" />}
              </button>

              {isOpen && (
                <div className="ml-5 pl-2.5 border-l border-border mt-0.5 mb-1 space-y-px">
                  <SubNavItem href={`/dept/${dept.slug}`} label="All Boards" active={pathname === `/dept/${dept.slug}`} />
                  <SubNavItem href={`/dept/${dept.slug}/members`} label="Members" active={pathname === `/dept/${dept.slug}/members`} />
                </div>
              )}
            </div>
          );
        })}

        {isAdmin && (
          <button onClick={onAddDept} className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer bg-transparent text-text-muted transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary mt-1 border border-dashed border-border text-[13px]">
            <Plus size={13} />
            Add Department
          </button>
        )}
      </nav>

      {/* Profile */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar name={user?.name ?? "User"} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-text-primary truncate">{user?.name ?? "User"}</div>
            <div className="text-[10px] text-text-muted truncate">{formatRole(userOrgRole)}</div>
          </div>
          <button onClick={handleLogout} className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors duration-150 cursor-pointer bg-transparent border-none" title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function formatRole(role: string) { return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-2 h-8 px-2.5 ml-1 rounded-md no-underline transition-colors duration-150",
      active ? "bg-bg-elevated text-text-primary font-medium" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
    )}>
      <span className={cn("shrink-0 w-4 flex justify-center", active ? "text-primary" : "text-text-muted")}>{icon}</span>
      <span className="text-[13px]">{label}</span>
    </Link>
  );
}

function SubNavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn(
      "block py-1 px-2 rounded text-[12px] no-underline transition-colors duration-150",
      active ? "text-text-primary font-medium bg-bg-elevated" : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated"
    )}>
      {label}
    </Link>
  );
}
