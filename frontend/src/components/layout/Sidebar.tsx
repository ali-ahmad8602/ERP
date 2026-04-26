"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, BarChart3, Settings, LogOut, Plus,
  ChevronDown, ChevronRight, HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import type { Department } from "@/types";

interface SidebarProps {
  departments: Department[];
  userOrgRole: string;
  onAddDept?: () => void;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dept", icon: Building2, label: "Departments", matchPrefix: true },
  { href: "/reports", icon: BarChart3, label: "Reports" },
];

export function Sidebar({ departments, userOrgRole, onAddDept }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [departments[0]?._id ?? ""]: true });
  const isAdmin = ["super_admin", "org_admin"].includes(userOrgRole);
  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const isActive = (href: string, matchPrefix?: boolean) =>
    matchPrefix ? pathname.startsWith(href) : pathname === href;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] border-r border-[#ffffff08] bg-[#0A0A0B] flex flex-col z-30">
      {/* Logo */}
      <div className="h-12 flex items-center px-4 border-b border-[#ffffff08]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#3B82F6] rounded flex items-center justify-center">
            <span className="text-[10px] font-semibold text-white">IM</span>
          </div>
          <span className="text-[13px] font-medium text-[#FAFAFA]">InvoiceMate</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const active = isActive(item.href, item.matchPrefix);
            return (
              <li key={item.href}>
                <Link
                  href={item.href === "/dept" && departments[0] ? `/dept/${departments[0].slug}` : item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors relative no-underline",
                    active
                      ? "bg-[#18181B] text-[#3B82F6]"
                      : "text-[#71717A] hover:bg-[#18181B]/50 hover:text-[#A1A1AA]"
                  )}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#3B82F6] rounded-r" />}
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Departments */}
        {departments.length > 0 && (
          <div className="mt-6 mb-2 px-3 text-[10px] uppercase tracking-wider text-[#52525B] font-medium">
            Departments
          </div>
        )}
        <ul className="space-y-0.5">
          {departments.map(dept => {
            const active = pathname.startsWith(`/dept/${dept.slug}`);
            const open = expanded[dept._id];
            const count = dept.members?.length ?? 0;
            return (
              <li key={dept._id}>
                <button
                  onClick={() => toggle(dept._id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors border-none cursor-pointer text-left",
                    active ? "bg-[#18181B] text-[#FAFAFA]" : "text-[#71717A] hover:bg-[#18181B]/50 hover:text-[#A1A1AA]"
                  )}
                >
                  <span className="w-4 text-center text-[12px]">{dept.icon}</span>
                  <span className="flex-1 truncate">{dept.name}</span>
                  {count > 0 && <span className="text-[10px] text-[#52525B] tabular-nums">{count}</span>}
                  {open ? <ChevronDown size={11} className="text-[#52525B]" /> : <ChevronRight size={11} className="text-[#52525B]" />}
                </button>
                {open && (
                  <div className="ml-6 pl-2 border-l border-[#ffffff08] mt-0.5 mb-1 space-y-px">
                    <Link href={`/dept/${dept.slug}`} className={cn(
                      "block px-2 py-1 rounded text-[12px] no-underline transition-colors",
                      pathname === `/dept/${dept.slug}` ? "text-[#FAFAFA] bg-[#18181B]" : "text-[#52525B] hover:text-[#A1A1AA]"
                    )}>All Boards</Link>
                    <Link href={`/dept/${dept.slug}/members`} className={cn(
                      "block px-2 py-1 rounded text-[12px] no-underline transition-colors",
                      pathname === `/dept/${dept.slug}/members` ? "text-[#FAFAFA] bg-[#18181B]" : "text-[#52525B] hover:text-[#A1A1AA]"
                    )}>Members</Link>
                  </div>
                )}
              </li>
            );
          })}
          {isAdmin && (
            <li>
              <button onClick={onAddDept} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#18181B]/50 transition-colors cursor-pointer border-none">
                <Plus size={12} /> Add Department
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="py-3 px-2 border-t border-[#ffffff08]">
        <ul className="space-y-0.5">
          <li>
            <Link href="/settings/profile" className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors no-underline",
              pathname.startsWith("/settings") ? "bg-[#18181B] text-[#3B82F6]" : "text-[#71717A] hover:bg-[#18181B]/50 hover:text-[#A1A1AA]"
            )}>
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* User */}
      <div className="p-3 border-t border-[#ffffff08]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#18181B] flex items-center justify-center">
            <span className="text-[11px] font-medium text-[#A1A1AA]">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#FAFAFA] truncate">{user?.name ?? "User"}</p>
            <p className="text-[10px] text-[#52525B] truncate">{userOrgRole.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }} className="w-5 h-5 flex items-center justify-center text-[#52525B] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none">
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
