"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, UserPlus } from "lucide-react";

const tabs = [
  { href: "/settings/invites", label: "Invite Users", icon: <UserPlus size={13} /> },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#080808" }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px 0", borderBottom: "1px solid #1A1A1A",
        background: "#0A0A0A", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Settings size={18} color="#0454FC" />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#F3F3F3", letterSpacing: "-0.02em" }}>Settings</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(tab => {
            const active = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", fontSize: 13, textDecoration: "none",
                color: active ? "#D0D0D0" : "#555",
                borderBottom: active ? "2px solid #0454FC" : "2px solid transparent",
                fontWeight: active ? 500 : 400,
                transition: "color 0.1s",
              }}>
                {tab.icon} {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
        {children}
      </div>
    </div>
  );
}
