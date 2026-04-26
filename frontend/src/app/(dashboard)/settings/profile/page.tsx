"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Check, AlertCircle, User, Lock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setProfileMsg(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        await fetchMe();
        setProfileMsg({ type: "success", text: "Profile updated successfully" });
      } else {
        const data = await res.json().catch(() => ({}));
        setProfileMsg({ type: "error", text: data.message || "Failed to update profile" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Failed to update profile. The API endpoint may not be available yet." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPassword.length < 8) {
      setPwMsg({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "Passwords do not match" });
      return;
    }

    setChangingPw(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setPwMsg({ type: "success", text: "Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json().catch(() => ({}));
        setPwMsg({ type: "error", text: data.message || "Failed to change password" });
      }
    } catch {
      setPwMsg({ type: "error", text: "Failed to change password. The API endpoint may not be available yet." });
    } finally {
      setChangingPw(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Profile Info */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <User size={16} className="text-primary" />
          <h2 className="text-[15px] font-bold text-text-primary tracking-tight">Profile Information</h2>
        </div>

        <div className="flex items-center gap-5 mb-6">
          <Avatar name={user.name} size="lg" className="w-16 h-16 text-[24px]" />
          <div>
            <div className="text-[16px] font-semibold text-text-primary">{user.name}</div>
            <div className="text-[13px] text-text-muted">{user.email}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield size={11} className="text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                {formatRole(user.orgRole)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="flex flex-col gap-3.5">
          <div>
            <SectionLabel className="mb-2">Display Name</SectionLabel>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <SectionLabel className="mb-2">Email</SectionLabel>
            <Input value={user.email} disabled className="opacity-60" />
            <p className="text-[11px] text-text-muted mt-1">Email cannot be changed</p>
          </div>

          {profileMsg && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium",
              profileMsg.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}>
              {profileMsg.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
              {profileMsg.text}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={saving}
            disabled={name.trim() === user.name}
            className="self-start"
          >
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={16} className="text-primary" />
          <h2 className="text-[15px] font-bold text-text-primary tracking-tight">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3.5">
          <div>
            <SectionLabel className="mb-2">Current Password</SectionLabel>
            <Input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <SectionLabel className="mb-2">New Password</SectionLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>

          <div>
            <SectionLabel className="mb-2">Confirm New Password</SectionLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>

          {pwMsg && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium",
              pwMsg.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}>
              {pwMsg.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
              {pwMsg.text}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={changingPw}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            className="self-start"
          >
            Change Password
          </Button>
        </form>
      </Card>

      {/* Department Memberships */}
      {user.departments.length > 0 && (
        <Card padding="lg">
          <h2 className="text-[15px] font-bold text-text-primary tracking-tight mb-4">Department Memberships</h2>
          <div className="flex flex-col gap-2">
            {user.departments.map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border-subtle last:border-0">
                <span className="text-[14px]">{d.department?.icon ?? "📁"}</span>
                <span className="text-[13px] font-medium text-text-primary flex-1">
                  {d.department?.name ?? "Unknown"}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {d.role.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
