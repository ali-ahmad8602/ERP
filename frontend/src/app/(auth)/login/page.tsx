"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LayoutGrid } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex" }}>

      {/* Left branding panel */}
      <div style={{
        width: 480, flexShrink: 0, background: "#0F0F0F",
        borderRight: "1px solid #2A2A2A", display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: 48,
      }} className="hidden lg:flex">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#0454FC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LayoutGrid size={16} color="white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#F3F3F3" }}>InvoiceMate</span>
        </div>

        {/* Copy */}
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#F3F3F3", lineHeight: 1.3, marginBottom: 12 }}>
            Turning Waiting Capital<br />Into Working Capital
          </h2>
          <p style={{ fontSize: 15, color: "#888888", lineHeight: 1.7 }}>
            One workspace for every team — Legal, Risk, Tech, Finance, Marketing and more.
            All your backlogs, boards, and workflows in one place.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {["Kanban Boards", "Role-Based Access", "Audit Trails", "Compliance Tagging", "Approval Workflows"].map(f => (
              <span key={f} style={{ padding: "5px 12px", borderRadius: 20, background: "#1A1A1A", border: "1px solid #2A2A2A", fontSize: 12, color: "#888888" }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#444444" }}>
          © {new Date().getFullYear()} InvoiceMate · Shariah-Compliant · Blockchain-Verified · AI-Powered
        </p>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }} className="flex lg:hidden">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#0454FC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LayoutGrid size={14} color="white" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#F3F3F3" }}>InvoiceMate</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#F3F3F3", marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#888888", marginBottom: 32 }}>Sign in to your workspace</p>

          {error && (
            <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 8, background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", fontSize: 13, color: "#FF4444" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#888888", marginBottom: 6 }}>
                Email address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@invoicemate.net" required
                style={{
                  width: "100%", background: "#0F0F0F", border: "1px solid #2A2A2A",
                  borderRadius: 8, padding: "10px 14px", fontSize: 13,
                  color: "#F3F3F3", outline: "none", transition: "border-color 0.15s",
                }}
                className="placeholder:text-[#444]"
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(4,84,252,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "#2A2A2A")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#888888", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: "100%", background: "#0F0F0F", border: "1px solid #2A2A2A",
                    borderRadius: 8, padding: "10px 40px 10px 14px", fontSize: 13,
                    color: "#F3F3F3", outline: "none", transition: "border-color 0.15s",
                  }}
                  className="placeholder:text-[#444]"
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(4,84,252,0.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#2A2A2A")}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#555555",
                }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 0", borderRadius: 8, background: loading ? "#0340CC" : "#0454FC",
              color: "white", fontSize: 14, fontWeight: 500, border: "none",
              cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s",
              marginTop: 4,
            }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#3B7BFF"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#0454FC"; }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#555555" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#0454FC", textDecoration: "none" }}>
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
