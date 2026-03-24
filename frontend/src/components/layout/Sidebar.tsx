"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LayoutDashboard, ChevronDown, ChevronRight, Building2, Settings, LogOut, Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
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
    <aside style={{
      width: 228, height: "100vh", background: "#0A0A0A",
      borderRight: "1px solid #1E1E1E", display: "flex",
      flexDirection: "column", flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ height: 56, display: "flex", alignItems: "center", padding: "0 14px", borderBottom: "1px solid #1E1E1E", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #0454FC 0%, #3B7BFF 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(4,84,252,0.4)",
          }}>
            <LayoutGrid size={14} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#F3F3F3", letterSpacing: "-0.02em" }}>InvoiceMate</div>
            <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em" }}>Workspace</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>

        {/* Dashboard */}
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard size={14} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
          accentColor="#0454FC"
        />

        {/* Company Board */}
        {isTopMgmt && (
          <NavItem
            href="/company"
            icon={<Building2 size={14} />}
            label="Company Board"
            active={pathname === "/company"}
            accentColor="#0454FC"
          />
        )}

        {/* Dept section label */}
        {departments.length > 0 && (
          <div style={{ padding: "14px 8px 5px", fontSize: 9.5, fontWeight: 700, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Departments
          </div>
        )}

        {/* Departments */}
        {departments.map(dept => {
          const isActive = pathname.startsWith(`/dept/${dept.slug}`);
          const isOpen   = expanded[dept._id];
          return (
            <div key={dept._id} style={{ marginBottom: 1 }}>
              {/* Dept row */}
              <button onClick={() => toggle(dept._id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "7px 8px", borderRadius: 8, border: "none", cursor: "pointer",
                background: isActive ? "#151515" : "transparent",
                color: isActive ? "#F3F3F3" : "#666666",
                position: "relative", transition: "background 0.12s, color 0.12s",
              }}
                className="nav-item"
              >
                {/* Active indicator */}
                {isActive && (
                  <div style={{
                    position: "absolute", left: 0, top: "20%", bottom: "20%",
                    width: 3, borderRadius: "0 3px 3px 0",
                    background: dept.color || "#0454FC",
                  }} />
                )}

                {/* Dept icon with color tint */}
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: isActive ? `${dept.color || "#0454FC"}18` : "#161616",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, transition: "background 0.12s",
                }}>
                  {dept.icon}
                </div>

                <span style={{
                  flex: 1, fontSize: 13, textAlign: "left",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                }}>
                  {dept.name}
                </span>

                {/* Member count badge */}
                {dept.members?.length > 0 && (
                  <span style={{ fontSize: 10, color: "#333", background: "#1A1A1A", padding: "0 5px", borderRadius: 10, flexShrink: 0 }}>
                    {dept.members.length}
                  </span>
                )}

                {isOpen
                  ? <ChevronDown size={11} color="#333" style={{ flexShrink: 0 }} />
                  : <ChevronRight size={11} color="#333" style={{ flexShrink: 0 }} />
                }
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div style={{ marginLeft: 14, paddingLeft: 12, borderLeft: "1px solid #1E1E1E", marginTop: 2, marginBottom: 4 }}>
                  <SubNavItem href={`/dept/${dept.slug}`} label="All Boards" active={pathname === `/dept/${dept.slug}`} />
                  <SubNavItem href={`/dept/${dept.slug}/members`} label="Members" active={pathname.includes("/members")} />
                </div>
              )}
            </div>
          );
        })}

        {/* Add dept */}
        {isAdmin && (
          <button onClick={onAddDept} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "7px 8px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "transparent", color: "#333", fontSize: 12,
            marginTop: 4, transition: "background 0.12s, color 0.12s",
          }}
            className="nav-item"
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6, background: "#141414",
              border: "1px dashed #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Plus size={11} color="#333" />
            </div>
            <span>Add Department</span>
          </button>
        )}
      </nav>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid #1E1E1E", padding: "8px" }}>
        {isAdmin && (
          <BottomItem href="/settings/invites" icon={<Settings size={13} />} label="Settings" />
        )}
        <BottomItem onClick={handleLogout} icon={<LogOut size={13} />} label="Sign out" danger />
      </div>
    </aside>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavItem({ href, icon, label, active, accentColor = "#0454FC" }: {
  href: string; icon: React.ReactNode; label: string; active: boolean; accentColor?: string;
}) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 8px",
      borderRadius: 8, textDecoration: "none", marginBottom: 1,
      background: active ? "#151515" : "transparent",
      color: active ? "#F3F3F3" : "#666666",
      fontSize: 13, position: "relative",
      transition: "background 0.12s, color 0.12s",
    }}
      className="nav-item"
    >
      {active && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", background: accentColor }} />}
      <span style={{ color: active ? accentColor : "inherit" }}>{icon}</span>
      {label}
    </Link>
  );
}

function SubNavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{
      display: "block", padding: "5px 8px", borderRadius: 6,
      fontSize: 12, textDecoration: "none",
      color: active ? "#0454FC" : "#555",
      background: active ? "rgba(4,84,252,0.08)" : "transparent",
      transition: "background 0.1s, color 0.1s",
    }}
      className="nav-item"
    >
      {label}
    </Link>
  );
}

function BottomItem({ href, onClick, icon, label, danger }: { href?: string; onClick?: () => void; icon: React.ReactNode; label: string; danger?: boolean }) {
  const style: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8, padding: "7px 8px",
    borderRadius: 8, textDecoration: "none", fontSize: 12,
    color: "#555", background: "transparent",
    transition: "background 0.12s, color 0.12s",
    border: "none", cursor: "pointer", width: "100%",
  };
  const onEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (danger) { e.currentTarget.style.background = "rgba(255,68,68,0.06)"; e.currentTarget.style.color = "#FF4444"; }
    else { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#F3F3F3"; }
  };
  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555";
  };
  if (onClick) {
    return <button onClick={onClick} style={style} onMouseEnter={onEnter} onMouseLeave={onLeave}>{icon}{label}</button>;
  }
  return (
    <Link href={href!} style={style} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {icon}{label}
    </Link>
  );
}
