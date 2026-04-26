"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useDeptStore } from "@/store/dept.store";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Avatar } from "@/components/ui/Avatar";
import { Building, Users, Shield, LayoutGrid } from "lucide-react";

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ORG_ROLES = [
  { role: "super_admin", description: "Full system access. Can manage all settings, users, and departments." },
  { role: "org_admin", description: "Organization management. Can manage departments, invites, and boards." },
  { role: "top_management", description: "Read access across all departments. Can view reports and analytics." },
  { role: "user", description: "Standard user. Access is scoped to assigned departments and boards." },
];

export default function OrgSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { departments, fetchDepts } = useDeptStore();
  const isAdmin = ["super_admin", "org_admin"].includes(user?.orgRole ?? "");

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/settings/profile");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    fetchDepts();
  }, [fetchDepts]);

  if (!isAdmin) return null;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Organization Info */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <Building size={16} className="text-primary" />
          <h2 className="text-[15px] font-bold text-text-primary tracking-tight">Organization</h2>
        </div>

        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shadow-sm">
            <LayoutGrid size={28} />
          </div>
          <div>
            <div className="text-[18px] font-bold text-text-primary">InvoiceMate</div>
            <div className="text-[13px] text-text-muted">Enterprise Workspace</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-elevated rounded-xl p-4">
            <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-1">Departments</div>
            <div className="text-[24px] font-bold text-text-primary tabular-nums">{departments.length}</div>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4">
            <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-1">Total Members</div>
            <div className="text-[24px] font-bold text-text-primary tabular-nums">
              {departments.reduce((sum, d) => sum + (d.members?.length ?? 0), 0)}
            </div>
          </div>
        </div>
      </Card>

      {/* Departments Overview */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-5">
          <Users size={16} className="text-primary" />
          <h2 className="text-[15px] font-bold text-text-primary tracking-tight">Departments</h2>
        </div>

        {departments.length === 0 ? (
          <p className="text-[13px] text-text-muted py-4">No departments created yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {departments.map(dept => (
              <div key={dept._id} className="flex items-center gap-3 py-3 border-b border-border-subtle last:border-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] shrink-0"
                  style={{ backgroundColor: `${dept.color}1A`, color: dept.color }}
                >
                  {dept.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text-primary">{dept.name}</div>
                  {dept.description && (
                    <div className="text-[11px] text-text-muted truncate">{dept.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Users size={11} className="text-text-muted" />
                  <span className="text-[12px] text-text-muted font-medium">{dept.members?.length ?? 0}</span>
                </div>
                {(dept.heads?.length ?? 0) > 0 && (
                  <div className="flex -space-x-1.5 shrink-0">
                    {dept.heads.slice(0, 3).map(h => (
                      <Avatar key={h._id} name={h.name} size="xs" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Role Definitions */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={16} className="text-primary" />
          <h2 className="text-[15px] font-bold text-text-primary tracking-tight">Organization Roles</h2>
        </div>

        <div className="flex flex-col gap-3">
          {ORG_ROLES.map(r => (
            <div key={r.role} className="flex items-start gap-3 py-3 border-b border-border-subtle last:border-0">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary mt-0.5 shrink-0 whitespace-nowrap">
                {formatRole(r.role)}
              </span>
              <p className="text-[13px] text-text-secondary leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <SectionLabel>Board-Level Roles</SectionLabel>
          <div className="flex flex-col gap-2 mt-2">
            {[
              { role: "Board Owner", desc: "Full control over the board, columns, fields, and settings." },
              { role: "Editor", desc: "Can create, edit, move, and delete cards on the board." },
              { role: "Commenter", desc: "Can view cards and add comments, but cannot edit or move cards." },
              { role: "Viewer", desc: "Read-only access. Can view board and cards but cannot make changes." },
            ].map(r => (
              <div key={r.role} className="flex items-start gap-3 py-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-text-secondary mt-0.5 shrink-0 whitespace-nowrap">
                  {r.role}
                </span>
                <p className="text-[13px] text-text-muted">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
