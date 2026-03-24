"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LayoutGrid } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <div className="min-h-screen bg-bg-base flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex w-[480px] shrink-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light border-r border-border flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-primary to-primary-light shadow-lg flex items-center justify-center">
            <LayoutGrid size={16} className="text-white" />
          </div>
          <span className="text-base font-semibold text-white">InvoiceMate</span>
        </div>

        {/* Copy */}
        <div>
          <h2 className="text-[28px] font-bold text-white leading-tight mb-3">
            Turning Waiting Capital<br />Into Working Capital
          </h2>
          <p className="text-[15px] text-white/70 leading-relaxed">
            One workspace for every team — Legal, Risk, Tech, Finance, Marketing and more.
            All your backlogs, boards, and workflows in one place.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {["Kanban Boards", "Role-Based Access", "Audit Trails", "Compliance Tagging", "Approval Workflows"].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-primary-ghost text-primary-foreground text-xs border border-white/15">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-white/30">
          © {new Date().getFullYear()} InvoiceMate · Shariah-Compliant · Blockchain-Verified · AI-Powered
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <LayoutGrid size={14} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold text-text-primary">InvoiceMate</span>
          </div>

          <h1 className="text-[26px] font-bold text-text-primary mb-1">Welcome back</h1>
          <p className="text-sm text-text-secondary mb-8">Sign in to your workspace</p>

          {error && (
            <div className="mb-5 px-3.5 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-[13px] text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@invoicemate.net"
              required
            />

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:text-primary-light transition-colors">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
