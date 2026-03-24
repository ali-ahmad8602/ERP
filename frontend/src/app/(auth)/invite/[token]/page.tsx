"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LayoutGrid, Check, AlertTriangle, UserPlus } from "lucide-react";
import { inviteApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",  test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",            test: (p: string) => /\d/.test(p) },
];

interface InviteInfo {
  email: string;
  orgRole: string;
  departments?: { department: { _id: string; name: string; icon: string; color: string }; role: string }[];
}

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { login } = useAuthStore();

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [invalidReason, setInvalidReason] = useState("");
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    inviteApi.validate(token)
      .then(res => {
        if (res.valid) {
          setValid(true);
          setInviteInfo({ email: res.email!, orgRole: res.orgRole!, departments: res.departments });
        } else {
          setValid(false);
          setInvalidReason(res.reason || "Invalid invite");
        }
      })
      .catch(() => { setValid(false); setInvalidReason("Failed to validate invite"); })
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const { token: jwt, user } = await inviteApi.accept(token, { name: name.trim(), password });
      // Store token and user
      localStorage.setItem("token", jwt);
      useAuthStore.setState({ token: jwt, user });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (validating) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} color="#0454FC" className="animate-spin" />
      </div>
    );
  }

  // Invalid
  if (!valid) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ maxWidth: 400, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertTriangle size={24} color="#FF4444" />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#F3F3F3", marginBottom: 8 }}>Invite Not Valid</h1>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>{invalidReason}</p>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: 9, background: "#0454FC", color: "white",
            fontSize: 13, fontWeight: 500, textDecoration: "none",
          }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Valid — registration form
  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 32 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #0454FC 0%, #3B7BFF 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LayoutGrid size={14} color="white" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#F3F3F3" }}>InvoiceMate</span>
        </div>

        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <UserPlus size={16} color="#22C55E" />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#F3F3F3" }}>You&apos;re invited!</h1>
          </div>
          <p style={{ fontSize: 13, color: "#666" }}>
            Complete your registration to join InvoiceMate Workspace.
          </p>
        </div>

        {/* Invite details */}
        <div style={{
          background: "#0C0C0C", border: "1px solid #1A1A1A", borderRadius: 10,
          padding: 14, marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 700 }}>Your Invite</div>
          <div style={{ fontSize: 13, color: "#D0D0D0", marginBottom: 4 }}>{inviteInfo?.email}</div>
          <div style={{ fontSize: 12, color: "#555" }}>Role: {inviteInfo?.orgRole}</div>
          {inviteInfo?.departments && inviteInfo.departments.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {inviteInfo.departments.map((d, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 6,
                  background: `${d.department.color}14`, color: d.department.color,
                  border: `1px solid ${d.department.color}30`,
                }}>
                  {d.department.icon} {d.department.name} ({d.role})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Full Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" required autoFocus
              style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 9, padding: "10px 12px", fontSize: 13, color: "#F3F3F3", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Email</label>
            <input
              value={inviteInfo?.email || ""} readOnly
              style={{ width: "100%", background: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: 9, padding: "10px 12px", fontSize: 13, color: "#666", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Create a password" required
                style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 9, padding: "10px 12px", paddingRight: 40, fontSize: 13, color: "#F3F3F3", outline: "none", boxSizing: "border-box" }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#444",
              }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Password rules */}
            {password.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {PASSWORD_RULES.map(rule => {
                  const pass = rule.test(password);
                  return (
                    <div key={rule.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: pass ? "#22C55E" : "#444" }}>
                      <Check size={10} /> {rule.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#FF4444", background: "rgba(255,68,68,0.08)", padding: "8px 12px", borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={!name.trim() || password.length < 8 || submitting} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "11px 0", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 500,
            background: name.trim() && password.length >= 8 && !submitting ? "#0454FC" : "#1A1A1A",
            color: name.trim() && password.length >= 8 && !submitting ? "white" : "#444",
            cursor: name.trim() && password.length >= 8 && !submitting ? "pointer" : "not-allowed",
            marginTop: 4,
          }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            {submitting ? "Creating account..." : "Join Workspace"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#444" }}>
          Already have an account? <Link href="/login" style={{ color: "#0454FC", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
