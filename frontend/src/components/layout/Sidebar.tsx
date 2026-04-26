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
    <aside className="w-[240px] h-screen bg-bg-base border-r border-border flex flex-col shrink-0">
      {/* ── Logo Area ──────────────────────────────────────────────────────── */}
      <div className="h-14 flex items-center px-5 shrink-0 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-bold text-text-primary tracking-tight leading-none">
              InvoiceMate
            </div>
            <div className="text-[9px] uppercase tracking-[0.12em] text-text-muted font-semibold mt-0.5">
              Workspace
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {/* Dashboard */}
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard size={16} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />

        {/* Departments link — active when on any dept page */}
        <NavItem
          href={departments[0] ? `/dept/${departments[0].slug}` : "#"}
          icon={<Building2 size={16} />}
          label="Departments"
          active={isDeptActive}
        />

        {/* Reports */}
        <NavItem
          href="/reports"
          icon={<FileText size={16} />}
          label="Reports"
          active={pathname === "/reports"}
        />

        {/* Settings */}
        <NavItem
          href="/settings/profile"
          icon={<Settings size={16} />}
          label="Settings"
          active={pathname.startsWith("/settings")}
        />

        {/* ── Departments Section ────────────────────────────────────────── */}
        {departments.length > 0 && (
          <div className="px-2 pt-6 pb-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-[0.08em]">
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
                  "w-full flex items-center gap-2.5 py-[7px] px-2 rounded-lg border-none cursor-pointer transition-all duration-150 group",
                  isActive
                    ? "bg-primary-ghost text-text-primary font-medium"
                    : "bg-transparent text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"
                )}
              >
                {/* Colored icon circle */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0"
                  style={{
                    color: dept.color || "var(--color-primary)",
                    background: `${dept.color || "var(--color-primary)"}1A`,
                  }}
                >
                  {dept.icon}
                </div>

                <span className="flex-1 text-[13px] text-left truncate">
                  {dept.name}
                </span>

                {/* Member count badge */}
                {memberCount > 0 && (
                  <span className="text-[10px] text-text-muted bg-black/5 dark:bg-white/10 rounded-full px-1.5 py-0.5 font-medium leading-none">
                    {memberCount}
                  </span>
                )}

                {isOpen ? (
                  <ChevronDown size={14} className="text-text-muted shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-text-muted shrink-0" />
                )}
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div className="ml-[18px] pl-3 border-l border-border-subtle mt-1 mb-2 space-y-0.5">
                  <SubNavItem
                    href={`/dept/${dept.slug}`}
                    label="All Boards"
                    active={pathname === `/dept/${dept.slug}`}
                  />
                  <SubNavItem
                    href={`/dept/${dept.slug}/members`}
                    label="Members"
                    active={pathname === `/dept/${dept.slug}/members`}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Add Department */}
        {isAdmin && (
          <button
            onClick={onAddDept}
            className="w-full flex items-center gap-2.5 py-[7px] px-2 rounded-lg cursor-pointer bg-transparent text-text-muted transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary mt-1 border border-dashed border-border"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center">
              <Plus size={14} />
            </div>
            <span className="text-[13px]">Add Department</span>
          </button>
        )}
      </nav>

      {/* ── Bottom Profile Section ─────────────────────────────────────────── */}
      <div className="p-3 border-t border-border-subtle">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar name={user?.name ?? "User"} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-text-primary truncate leading-tight">
              {user?.name ?? "User"}
            </div>
            <div className="text-[11px] text-text-muted truncate leading-tight mt-0.5">
              {formatRole(userOrgRole)}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors duration-150 cursor-pointer bg-transparent border-none shrink-0"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 py-[7px] px-2 rounded-lg no-underline transition-all duration-150 relative",
        active
          ? "bg-primary-ghost text-primary font-medium"
          : "bg-transparent text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"
      )}
    >
      {/* Left active indicator */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
      )}
      <span className={cn(active ? "text-primary" : "text-text-secondary")}>
        {icon}
      </span>
      <span className="text-[13px]">{label}</span>
    </Link>
  );
}

function SubNavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block py-1 px-2.5 rounded-md text-[12px] no-underline transition-colors duration-150",
        active
          ? "bg-primary-ghost text-primary font-medium"
          : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"
      )}
    >
      {label}
    </Link>
  );
}
