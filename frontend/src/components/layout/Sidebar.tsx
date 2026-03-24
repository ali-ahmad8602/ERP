"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LayoutDashboard, ChevronDown, ChevronRight, Building2, Settings, LogOut, Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import type { Department } from "@/types";

interface SidebarProps {
  departments: Department[];
  userOrgRole: string;
  onAddDept?: () => void;
}

export function Sidebar({ departments, userOrgRole, onAddDept }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [departments[0]?._id ?? ""]: true });
  const isAdmin  = ["super_admin", "org_admin"].includes(userOrgRole);
  const isTopMgmt = ["super_admin", "org_admin", "top_management"].includes(userOrgRole);

  const handleLogout = () => { logout(); router.push("/login"); };

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <aside className="w-[228px] h-screen bg-bg-base border-r border-border-subtle flex flex-col shrink-0">

      {/* Logo */}
      <div className="h-14 flex items-center px-3.5 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-[9px]">
          <div className="w-7 h-7 rounded-btn bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-[0_2px_8px_var(--color-primary-ghost)]">
            <LayoutGrid size={14} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-text-primary tracking-tight">InvoiceMate</div>
            <div className="text-[9px] text-text-muted uppercase tracking-widest">Workspace</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-[10px_8px]">

        {/* Dashboard */}
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard size={14} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />

        {/* Company Board */}
        {isTopMgmt && (
          <NavItem
            href="/company"
            icon={<Building2 size={14} />}
            label="Company Board"
            active={pathname === "/company"}
          />
        )}

        {/* Dept section label */}
        {departments.length > 0 && (
          <div className="px-2 pt-3.5 pb-[5px] text-[9.5px] font-bold text-text-muted uppercase tracking-widest">
            Departments
          </div>
        )}

        {/* Departments */}
        {departments.map(dept => {
          const isActive = pathname.startsWith(`/dept/${dept.slug}`);
          const isOpen   = expanded[dept._id];
          return (
            <div key={dept._id} className="mb-px">
              {/* Dept row */}
              <button
                onClick={() => toggle(dept._id)}
                className={cn(
                  "w-full flex items-center gap-2 py-[7px] px-2 rounded-btn border-none cursor-pointer relative transition-colors",
                  isActive
                    ? "bg-bg-elevated text-text-primary"
                    : "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px]"
                    style={{ background: dept.color || "var(--color-primary)" }}
                  />
                )}

                {/* Dept icon with color tint */}
                <div
                  className="w-[22px] h-[22px] rounded-badge shrink-0 flex items-center justify-center text-xs transition-colors"
                  style={{
                    background: isActive
                      ? `${dept.color || "var(--color-primary)"}18`
                      : "var(--color-bg-elevated)",
                  }}
                >
                  {dept.icon}
                </div>

                <span className="flex-1 text-[13px] text-left overflow-hidden text-ellipsis whitespace-nowrap tracking-tight">
                  {dept.name}
                </span>

                {/* Member count badge */}
                {dept.members?.length > 0 && (
                  <span className="text-[10px] text-text-muted bg-bg-elevated px-[5px] rounded-full shrink-0">
                    {dept.members.length}
                  </span>
                )}

                {isOpen
                  ? <ChevronDown size={11} className="text-text-muted shrink-0" />
                  : <ChevronRight size={11} className="text-text-muted shrink-0" />
                }
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div className="ml-3.5 pl-3 border-l border-border-subtle mt-0.5 mb-1">
                  <SubNavItem href={`/dept/${dept.slug}`} label="All Boards" active={pathname === `/dept/${dept.slug}`} />
                  <SubNavItem href={`/dept/${dept.slug}/members`} label="Members" active={pathname.includes("/members")} />
                </div>
              )}
            </div>
          );
        })}

        {/* Add dept */}
        {isAdmin && (
          <button
            onClick={onAddDept}
            className="w-full flex items-center gap-2 py-[7px] px-2 rounded-btn border-none cursor-pointer bg-transparent text-text-muted text-xs mt-1 transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            <div className="w-[22px] h-[22px] rounded-badge bg-bg-elevated border border-dashed border-border flex items-center justify-center">
              <Plus size={11} className="text-text-muted" />
            </div>
            <span>Add Department</span>
          </button>
        )}
      </nav>

      {/* Bottom bar */}
      <div className="border-t border-border-subtle p-2">
        {isAdmin && (
          <BottomItem href="/settings/invites" icon={<Settings size={13} />} label="Settings" />
        )}
        <BottomItem onClick={handleLogout} icon={<LogOut size={13} />} label="Sign out" danger />
      </div>
    </aside>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavItem({ href, icon, label, active }: {
  href: string; icon: React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 py-[7px] px-2 rounded-btn no-underline mb-px relative transition-colors",
        active
          ? "bg-bg-elevated text-text-primary"
          : "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
      )}
    >
      {active && (
        <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px] bg-primary" />
      )}
      <span className={cn(active ? "text-primary" : "text-inherit")}>{icon}</span>
      <span className="text-[13px]">{label}</span>
    </Link>
  );
}

function SubNavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "block py-[5px] px-2 rounded-badge text-xs no-underline transition-colors",
        active
          ? "text-primary bg-primary-ghost"
          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
      )}
    >
      {label}
    </Link>
  );
}

function BottomItem({ href, onClick, icon, label, danger }: {
  href?: string; onClick?: () => void; icon: React.ReactNode; label: string; danger?: boolean;
}) {
  const classes = cn(
    "flex items-center gap-2 py-[7px] px-2 rounded-btn no-underline text-xs border-none cursor-pointer w-full transition-colors",
    "text-text-secondary bg-transparent",
    danger
      ? "hover:bg-danger/5 hover:text-danger"
      : "hover:bg-bg-elevated hover:text-text-primary"
  );

  if (onClick) {
    return <button onClick={onClick} className={classes}>{icon}{label}</button>;
  }
  return (
    <Link href={href!} className={classes}>
      {icon}{label}
    </Link>
  );
}
