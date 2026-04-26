"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, UserPlus, UserCircle, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const profileTab = { href: "/settings/profile", label: "Profile", icon: <UserCircle size={13} /> };
const inviteTab = { href: "/settings/invites", label: "Invite Users", icon: <UserPlus size={13} /> };
const orgTab = { href: "/settings/org", label: "Organization", icon: <Building size={13} /> };

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = ["super_admin", "org_admin"].includes(user?.orgRole ?? "");

  const tabs = isAdmin ? [profileTab, inviteTab, orgTab] : [profileTab];

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* Header */}
      <div className="px-6 pt-4 pb-0 border-b border-border bg-bg-surface shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={16} className="text-primary" />
          <h1 className="text-[16px] font-bold text-text-primary tracking-tight">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5">
          {tabs.map(tab => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 text-[13px] no-underline transition-colors",
                  active
                    ? "border-b-2 border-primary text-text-primary font-medium"
                    : "border-b-2 border-transparent text-text-muted hover:text-text-secondary"
                )}
              >
                {tab.icon} {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5">
        {children}
      </div>
    </div>
  );
}
