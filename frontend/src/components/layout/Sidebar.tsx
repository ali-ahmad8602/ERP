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
  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <aside className="w-[228px] h-screen bg-bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo — h-12 */}
      <div className="h-12 flex items-center px-4 shrink-0 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[5px] bg-primary text-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="white"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.4"/></svg>
          </div>
          <span className="text-[13px] font-semibold text-text-primary tracking-tight">InvoiceMate</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" active={pathname === "/dashboard"} />
          <NavItem href={departments[0] ? `/dept/${departments[0].slug}` : "#"} icon={<Building2 size={14} />} label="Departments" active={pathname.startsWith("/dept/")} />
          <NavItem href="/reports" icon={<BarChart3 size={14} />} label="Reports" active={pathname === "/reports"} />
          <NavItem href="/settings/profile" icon={<Settings size={14} />} label="Settings" active={pathname.startsWith("/settings")} />
        </div>

        {departments.length > 0 && (
          <div className="mt-6 mb-2 px-3 text-[11px] font-medium text-text-muted uppercase tracking-[0.04em]">Teams</div>
        )}

        <div className="space-y-px">
          {departments.map(dept => {
            const active = pathname.startsWith(`/dept/${dept.slug}`);
            const open = expanded[dept._id];
            const count = dept.members?.length ?? 0;
            return (
              <div key={dept._id}>
                <button onClick={() => toggle(dept._id)} className={cn(
                  "w-full flex items-center gap-2 h-7 px-3 rounded-[6px] border-none cursor-pointer transition-colors duration-100 text-left text-[13px]",
                  active ? "bg-bg-elevated text-text-primary" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                )}>
                  <span className="w-4 text-center shrink-0" style={{ color: dept.color || "var(--color-text-muted)" }}>{dept.icon}</span>
                  <span className="flex-1 truncate">{dept.name}</span>
                  {count > 0 && <span className="text-[10px] text-text-muted tabular-nums">{count}</span>}
                  {open ? <ChevronDown size={11} className="text-text-muted shrink-0" /> : <ChevronRight size={11} className="text-text-muted shrink-0" />}
                </button>
                {open && (
                  <div className="ml-6 pl-2 border-l border-border space-y-px mt-0.5 mb-1">
                    <SubNav href={`/dept/${dept.slug}`} label="Boards" active={pathname === `/dept/${dept.slug}`} />
                    <SubNav href={`/dept/${dept.slug}/members`} label="Members" active={pathname === `/dept/${dept.slug}/members`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isAdmin && (
          <button onClick={onAddDept} className="w-full flex items-center gap-2 h-7 px-3 rounded-[6px] cursor-pointer bg-transparent text-text-muted transition-colors duration-100 hover:bg-bg-elevated hover:text-text-primary mt-2 border border-dashed border-border text-[12px]">
            <Plus size={12} /> Add Team
          </button>
        )}
      </nav>

      {/* Profile */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Avatar name={user?.name ?? "U"} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-text-primary truncate">{user?.name ?? "User"}</div>
            <div className="text-[10px] text-text-muted truncate">{userOrgRole.replace(/_/g, " ")}</div>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }} className="w-6 h-6 rounded-[4px] flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/8 transition-colors duration-100 cursor-pointer bg-transparent border-none" title="Sign out">
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-2 h-7 px-3 rounded-[6px] no-underline transition-colors duration-100 text-[13px]",
      active ? "bg-bg-elevated text-text-primary font-medium" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
    )}>
      <span className={cn("w-4 flex justify-center shrink-0", active ? "text-primary" : "text-text-muted")}>{icon}</span>
      {label}
    </Link>
  );
}

function SubNav({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn(
      "block h-6 leading-6 px-2 rounded-[4px] text-[12px] no-underline transition-colors duration-100",
      active ? "text-text-primary bg-bg-elevated" : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated"
    )}>
      {label}
    </Link>
  );
}
