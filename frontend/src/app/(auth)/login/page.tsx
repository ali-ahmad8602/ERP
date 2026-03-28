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
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-[#1D2939] via-[#2B3B4E] to-[#344054] overflow-hidden">
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
                className={`w-8 h-8 rounded-full ${bg} ring-2 ring-[#1D2939] flex items-center justify-center text-[11px] font-bold text-white`}
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
      <div className="w-full lg:w-[540px] xl:w-[580px] shrink-0 flex items-center justify-center p-6 sm:p-10 bg-bg-surface">
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

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12px] text-text-muted font-medium uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-bg-surface hover:bg-black/[0.03] transition-colors text-[14px] font-medium text-text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-bg-surface hover:bg-black/[0.03] transition-colors text-[14px] font-medium text-text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                <path d="M10 0h1c3.18.05 5.9 1.2 7.87 3.17A10.46 10.46 0 0 1 21 10v1H11V0Z" fill="#F25022"/>
                <path d="M0 0h1c.04 0 9 0 9 0v11H0V0Z" fill="#F25022" opacity=".01"/><path d="M0 0h10v11H0z" fill="#7FBA00"/>
                <path d="M11 11h10v10H11z" fill="#00A4EF"/>
                <path d="M0 11h10v10H0z" fill="#FFB900"/>
              </svg>
              Microsoft
            </button>
          </div>

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
