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
  const [remember, setRemember] = useState(false);
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
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-[#050505] via-[#0A0E18] to-[#0F1525] overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-[-150px] left-[-80px] w-[400px] h-[400px] rounded-full bg-white/[0.04]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">InvoiceMate</span>
        </div>

        {/* Heading */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-[42px] xl:text-[48px] font-extrabold text-white leading-[1.08] tracking-tight mb-5">
            Modern Enterprise{"\n"}Intelligence
          </h2>
          <p className="text-[16px] text-white/60 leading-relaxed max-w-md">
            One streamlined platform for invoicing, compliance, approvals, and financial intelligence — built for teams that move fast.
          </p>
        </div>

        {/* Social proof */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {[
              "bg-blue-400",
              "bg-emerald-400",
              "bg-amber-400",
              "bg-rose-400",
              "bg-violet-400",
            ].map((bg, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full ${bg} ring-2 ring-[#050505] flex items-center justify-center text-[11px] font-bold text-white`}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-[13px] text-white/50 font-medium">
            Joined by 500+ global enterprises this month
          </span>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-[540px] xl:w-[580px] shrink-0 flex items-center justify-center p-6 sm:p-10 bg-bg-base">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <LayoutGrid size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">InvoiceMate</span>
          </div>

          <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight mb-1.5">
            Welcome Back
          </h1>
          <p className="text-[15px] text-text-secondary mb-8">
            Access your enterprise dashboard
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-[13px] font-medium text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />

            {/* Password with eye toggle */}
            <div className="relative">
              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-4 bottom-3.5 text-text-muted hover:text-text-primary transition-colors"
                title={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
                />
                <span className="text-[13px] text-text-secondary">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[13px] text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Primary CTA */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Secondary CTA */}
            <Link href="/register" className="w-full">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full border border-border"
              >
                Request Access
              </Button>
            </Link>
          </form>


          {/* Footer */}
          <p className="mt-8 text-center text-[12px] text-text-muted leading-relaxed">
            By continuing, you agree to InvoiceMate&apos;s{" "}
            <Link href="/terms" className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
