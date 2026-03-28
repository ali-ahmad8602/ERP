"use client";
import { useEffect, useState } from "react";
import { inviteApi } from "@/lib/api";
import { useDeptStore } from "@/store/dept.store";
import { Send, Copy, Check, X, Loader2, UserPlus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/utils";
import type { Invite } from "@/types";

const ORG_ROLES = [
  { value: "user", label: "User" },
  { value: "top_management", label: "Top Management" },
  { value: "org_admin", label: "Org Admin" },
];

const DEPT_ROLES = [
  { value: "member", label: "Member" },
  { value: "dept_head", label: "Department Head" },
  { value: "guest", label: "Guest" },
];

export default function InvitesPage() {
  const { departments, fetchDepts } = useDeptStore();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [orgRole, setOrgRole] = useState("user");
  const [selectedDepts, setSelectedDepts] = useState<{ department: string; role: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepts();
    loadInvites();
  }, [fetchDepts]);

  async function loadInvites() {
    setLoading(true);
    try {
      const { invites } = await inviteApi.list();
      setInvites(invites);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setInviteUrl(null);
    try {
      const { invite, inviteUrl } = await inviteApi.create({
        email: email.trim(),
        orgRole,
        departments: selectedDepts.filter(d => d.department),
      });
      setInviteUrl(inviteUrl);
      setInvites(prev => [invite, ...prev]);
      setEmail("");
      setOrgRole("user");
      setSelectedDepts([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await inviteApi.revoke(id);
      setInvites(prev => prev.map(i => i._id === id ? { ...i, status: 'expired' as const } : i));
    } catch { /* ignore */ }
  }

  function handleCopy() {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function addDeptSelection() {
    setSelectedDepts(prev => [...prev, { department: "", role: "member" }]);
  }

  function updateDeptSelection(idx: number, field: "department" | "role", value: string) {
    setSelectedDepts(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }

  function removeDeptSelection(idx: number) {
    setSelectedDepts(prev => prev.filter((_, i) => i !== idx));
  }

  const statusIcon = (status: string) => {
    if (status === "pending") return <Clock size={12} className="text-warning" />;
    if (status === "accepted") return <CheckCircle2 size={12} className="text-accent" />;
    return <XCircle size={12} className="text-danger" />;
  };

  return (
    <div className="max-w-[720px]">
      {/* Invite Form */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={16} className="text-primary" />
          <h2 className="text-[15px] font-semibold text-text-primary">Invite a User</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="colleague@invoicemate.com"
            required
          />

          {/* Org Role */}
          <div>
            <SectionLabel className="mb-1.5">Organization Role</SectionLabel>
            <div className="flex gap-1.5">
              {ORG_ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setOrgRole(r.value)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-[7px] text-xs border cursor-pointer transition-all duration-100",
                    orgRole === r.value
                      ? "bg-primary-ghost border-primary text-primary font-semibold"
                      : "bg-bg-surface border-border text-text-secondary hover:bg-bg-elevated"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Department assignments */}
          <div>
            <SectionLabel className="mb-1.5">Departments (optional)</SectionLabel>
            {selectedDepts.map((d, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={d.department}
                  onChange={e => updateDeptSelection(idx, "department", e.target.value)}
                  className="flex-1 bg-bg-surface border border-border rounded-btn px-2.5 py-2 text-xs text-text-primary outline-none"
                >
                  <option value="">Select department...</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.icon} {dept.name}</option>
                  ))}
                </select>
                <select
                  value={d.role}
                  onChange={e => updateDeptSelection(idx, "role", e.target.value)}
                  className="w-[150px] bg-bg-surface border border-border rounded-btn px-2.5 py-2 text-xs text-text-primary outline-none"
                >
                  {DEPT_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeDeptSelection(idx)}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-[7px] bg-bg-surface border border-border cursor-pointer text-text-muted hover:text-danger hover:border-danger/40 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addDeptSelection}
              className="text-xs text-primary bg-transparent border border-dashed border-border rounded-[7px] px-3 py-1.5 cursor-pointer w-full hover:bg-primary-ghost hover:border-primary/40 transition-colors"
            >
              + Add department
            </button>
          </div>

          {error && (
            <div className="text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Invite URL result */}
          {inviteUrl && (
            <div className="bg-accent/5 border border-accent/20 rounded-[10px] p-3.5">
              <div className="text-xs text-accent font-semibold mb-2">Invite created! Share this link:</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 bg-bg-surface border border-border rounded-[7px] px-2.5 py-1.5 text-[11px] text-text-secondary outline-none font-mono"
                />
                <Button
                  type="button"
                  onClick={handleCopy}
                  variant={copied ? "primary" : "secondary"}
                  size="sm"
                  className={cn(copied && "bg-accent hover:bg-accent")}
                >
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </Button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!email.trim() || submitting}
            loading={submitting}
            className="w-full"
          >
            {submitting ? <Send size={13} /> : <Send size={13} />}
            {submitting ? "Sending..." : "Send Invite"}
          </Button>
        </form>
      </Card>

      {/* Invite List */}
      <div>
        <SectionLabel className="mb-3">
          All Invites ({invites.length})
        </SectionLabel>

        {loading && (
          <div className="py-6 text-center">
            <Loader2 size={18} className="animate-spin text-primary mx-auto" />
          </div>
        )}

        {!loading && invites.length === 0 && (
          <Card className="py-8 text-center text-text-muted text-[13px]">
            No invites sent yet.
          </Card>
        )}

        <div className="flex flex-col gap-1.5">
          {invites.map(invite => (
            <Card key={invite._id} padding="sm" className="flex items-center gap-3 !p-3">
              {statusIcon(invite.status)}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-text-primary font-medium">{invite.email}</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  {invite.orgRole} &middot; invited by {invite.invitedBy?.name || "Admin"} &middot; {new Date(invite.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className={cn(
                "text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wide",
                invite.status === "pending" && "text-warning bg-warning/10",
                invite.status === "accepted" && "text-accent bg-accent/10",
                invite.status !== "pending" && invite.status !== "accepted" && "text-danger bg-danger/10"
              )}>
                {invite.status}
              </span>
              {invite.status === "pending" && (
                <button
                  onClick={() => handleRevoke(invite._id)}
                  className="text-[11px] text-text-muted bg-transparent border border-border rounded-md px-2.5 py-1 cursor-pointer hover:border-danger/40 hover:text-danger transition-colors"
                >
                  Revoke
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
