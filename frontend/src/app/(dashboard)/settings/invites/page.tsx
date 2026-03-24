"use client";
import { useEffect, useState } from "react";
import { inviteApi } from "@/lib/api";
import { useDeptStore } from "@/store/dept.store";
import { Send, Copy, Check, X, Loader2, UserPlus, Clock, CheckCircle2, XCircle } from "lucide-react";
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
    if (status === "pending") return <Clock size={12} color="#F5A623" />;
    if (status === "accepted") return <CheckCircle2 size={12} color="#22C55E" />;
    return <XCircle size={12} color="#FF4444" />;
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Invite Form */}
      <div style={{ background: "#0C0C0C", border: "1px solid #1A1A1A", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <UserPlus size={16} color="#0454FC" />
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#E0E0E0" }}>Invite a User</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Email Address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="colleague@invoicemate.com" required
              style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 9, padding: "9px 12px", fontSize: 13, color: "#F3F3F3", outline: "none", boxSizing: "border-box" }}
              className="input-field"
            />
          </div>

          {/* Org Role */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Organization Role</label>
            <div style={{ display: "flex", gap: 6 }}>
              {ORG_ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setOrgRole(r.value)} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, border: "1px solid",
                  cursor: "pointer", transition: "all 0.1s",
                  background: orgRole === r.value ? "#0454FC14" : "#111",
                  borderColor: orgRole === r.value ? "#0454FC" : "#222",
                  color: orgRole === r.value ? "#0454FC" : "#888",
                  fontWeight: orgRole === r.value ? 600 : 400,
                }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Department assignments */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Departments (optional)</label>
            {selectedDepts.map((d, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <select
                  value={d.department}
                  onChange={e => updateDeptSelection(idx, "department", e.target.value)}
                  style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: 9, padding: "8px 10px", fontSize: 12, color: "#F3F3F3", outline: "none" }}
                >
                  <option value="">Select department...</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.icon} {dept.name}</option>
                  ))}
                </select>
                <select
                  value={d.role}
                  onChange={e => updateDeptSelection(idx, "role", e.target.value)}
                  style={{ width: 150, background: "#111", border: "1px solid #222", borderRadius: 9, padding: "8px 10px", fontSize: 12, color: "#F3F3F3", outline: "none" }}
                >
                  {DEPT_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeDeptSelection(idx)} style={{
                  width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 7, background: "#111", border: "1px solid #222", cursor: "pointer", color: "#555",
                }}><X size={12} /></button>
              </div>
            ))}
            <button type="button" onClick={addDeptSelection} style={{
              fontSize: 12, color: "#0454FC", background: "none", border: "1px dashed #222",
              borderRadius: 7, padding: "6px 12px", cursor: "pointer", width: "100%",
            }}>
              + Add department
            </button>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#FF4444", background: "rgba(255,68,68,0.08)", padding: "8px 12px", borderRadius: 8 }}>
              {error}
            </div>
          )}

          {/* Invite URL result */}
          {inviteUrl && (
            <div style={{ background: "#0A1A0A", border: "1px solid #1A3A1A", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 600, marginBottom: 8 }}>Invite created! Share this link:</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={inviteUrl} style={{
                  flex: 1, background: "#111", border: "1px solid #222", borderRadius: 7,
                  padding: "7px 10px", fontSize: 11, color: "#888", outline: "none", fontFamily: "monospace",
                }} />
                <button type="button" onClick={handleCopy} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12,
                  background: copied ? "#22C55E" : "#1A1A1A", color: copied ? "white" : "#888",
                }}>
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={!email.trim() || submitting} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "10px 0", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 500,
            background: email.trim() && !submitting ? "#0454FC" : "#1A1A1A",
            color: email.trim() && !submitting ? "white" : "#444",
            cursor: email.trim() && !submitting ? "pointer" : "not-allowed",
          }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
            {submitting ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>

      {/* Invite List */}
      <div>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          All Invites ({invites.length})
        </h2>

        {loading && (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Loader2 size={18} color="#0454FC" className="animate-spin" />
          </div>
        )}

        {!loading && invites.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "#444", fontSize: 13, background: "#0C0C0C", borderRadius: 12, border: "1px solid #1A1A1A" }}>
            No invites sent yet.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {invites.map(invite => (
            <div key={invite._id} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#0C0C0C", border: "1px solid #1A1A1A", borderRadius: 10,
              padding: "12px 16px",
            }}>
              {statusIcon(invite.status)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#D0D0D0", fontWeight: 500 }}>{invite.email}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                  {invite.orgRole} &middot; invited by {invite.invitedBy?.name || "Admin"} &middot; {new Date(invite.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                textTransform: "uppercase", letterSpacing: "0.06em",
                ...(invite.status === "pending" ? { color: "#F5A623", background: "rgba(245,166,35,0.1)" } :
                  invite.status === "accepted" ? { color: "#22C55E", background: "rgba(34,197,94,0.1)" } :
                    { color: "#FF4444", background: "rgba(255,68,68,0.1)" }),
              }}>
                {invite.status}
              </span>
              {invite.status === "pending" && (
                <button onClick={() => handleRevoke(invite._id)} style={{
                  fontSize: 11, color: "#555", background: "none", border: "1px solid #222",
                  borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF4444"; e.currentTarget.style.color = "#FF4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#555"; }}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
