"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { Department } from "@/types";

interface SidebarProps {
  departments: Department[];
  userOrgRole: string;
  onAddDept?: () => void;
}

export function Sidebar({ departments, userOrgRole, onAddDept }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [departments[0]?._id ?? ""]: true,
  });
  const isAdmin = ["super_admin", "org_admin"].includes(userOrgRole);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const toggle = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const isDeptActive = pathname.startsWith("/dept/");

  return (
    <aside className="w-[228px] h-screen bg-bg-surface border-r border-border-subtle flex flex-col shrink-0">
      {/* ── Logo Area ──────────────────────────────────────────────────────── */}
      <div className="h-[56px] flex items-center px-4 shrink-0 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary tracking-tight leading-none">
              InvoiceMate
            </div>
            <div className="text-[9.5px] uppercase tracking-[0.1em] text-text-secondary font-bold mt-0.5">
              Workspace
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" active={pathname === "/dashboard"} />
        <NavItem href={departments[0] ? `/dept/${departments[0].slug}` : "#"} icon={<Building2 size={16} />} label="Departments" active={isDeptActive} />
        <NavItem href="/reports" icon={<FileText size={16} />} label="Reports" active={pathname === "/reports"} />
        <NavItem href="/settings/profile" icon={<Settings size={16} />} label="Settings" active={pathname.startsWith("/settings")} />

        {/* ── Departments Section ────────────────────────────────────────── */}
        {departments.length > 0 && (
          <div className="px-2 pt-6 pb-1.5 text-[9.5px] font-bold text-text-secondary uppercase tracking-[0.1em]">
            Departments
          </div>
        )}

        {departments.map((dept) => {
          const isActive = pathname.startsWith(`/dept/${dept.slug}`);
          const isOpen = expanded[dept._id];
          const memberCount = dept.members?.length ?? 0;

          return (
            <div key={dept._id} className="mb-0.5">
              <button
                onClick={() => toggle(dept._id)}
                className={cn(
                  "w-full flex items-center gap-2.5 py-2 px-3 rounded-[8px] border-none cursor-pointer transition-all duration-200 group",
                  isActive
                    ? "bg-[#151515] text-text-primary font-medium border-l-2 border-l-primary"
                    : "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                )}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0"
                  style={{
                    color: dept.color || "var(--color-primary)",
                    background: `${dept.color || "var(--color-primary)"}1A`,
                  }}
                >
                  {dept.icon}
                </div>

                <span className="flex-1 text-sm text-left truncate">{dept.name}</span>

                {memberCount > 0 && (
                  <span className="text-[10px] text-[#555] bg-bg-elevated px-1.5 rounded font-medium">
                    {memberCount}
                  </span>
                )}

                {isOpen ? (
                  <ChevronDown size={14} className="text-text-muted shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-text-muted shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="ml-[18px] pl-3 border-l border-border-subtle mt-1 mb-2 space-y-0.5">
                  <SubNavItem href={`/dept/${dept.slug}`} label="All Boards" active={pathname === `/dept/${dept.slug}`} />
                  <SubNavItem href={`/dept/${dept.slug}/members`} label="Members" active={pathname === `/dept/${dept.slug}/members`} />
                </div>
              )}
            </div>
          );
        })}

        {isAdmin && (
          <button
            onClick={onAddDept}
            className="w-full flex items-center gap-2.5 py-2 px-3 rounded-[8px] cursor-pointer bg-transparent text-text-muted transition-all duration-200 hover:bg-bg-elevated hover:text-text-primary mt-1 border border-dashed border-border"
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center">
              <Plus size={14} />
            </div>
            <span className="text-sm">Add Department</span>
          </button>
        )}
      </nav>

      {/* ── Bottom Profile Section ─────────────────────────────────────────── */}
      <div className="p-3 border-t border-border-subtle">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar name={user?.name ?? "User"} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate leading-tight">
              {user?.name ?? "User"}
            </div>
            <div className="text-[10px] text-text-muted truncate leading-tight mt-0.5">
              {formatRole(userOrgRole)}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors duration-200 cursor-pointer bg-transparent border-none shrink-0"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean; }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-[8px] no-underline transition-all duration-200 relative",
        active
          ? "bg-[#151515] text-text-primary font-medium"
          : "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-primary" />
      )}
      <span className={cn(active ? "text-primary" : "text-text-secondary")}>{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

function SubNavItem({ href, label, active }: { href: string; label: string; active: boolean; }) {
  return (
    <Link
      href={href}
      className={cn(
        "block py-1.5 px-2.5 rounded-[6px] text-xs no-underline transition-colors duration-200",
        active
          ? "bg-[#151515] text-primary font-medium"
          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
      )}
    >
      {label}
    </Link>
  );
}
