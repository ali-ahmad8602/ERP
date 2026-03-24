"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LayoutGrid, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",  test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",            test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-8">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <LayoutGrid size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-text-primary">InvoiceMate</span>
        </div>

        <h1 className="text-[24px] font-bold text-text-primary mb-1">Create your account</h1>
        <p className="text-text-secondary text-small mb-8">
          Join your team workspace on InvoiceMate ERP
        </p>

        {error && (
          <div className="mb-5 px-3.5 py-2.5 rounded-btn bg-danger/10 border border-danger/20 text-danger text-small">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Ali Ahmad"
            required
          />

          <Input
            label="Work email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@invoicemate.net"
            required
          />

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
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

            {/* Password strength */}
            {form.password && (
              <div className="mt-2 space-y-1">
                {PASSWORD_RULES.map(rule => (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors",
                      rule.test(form.password) ? "bg-accent" : "bg-bg-elevated border border-border"
                    )}>
                      {rule.test(form.password) && <Check size={8} className="text-bg-base" strokeWidth={3} />}
                    </div>
                    <span className={cn(
                      "text-[11px] transition-colors",
                      rule.test(form.password) ? "text-accent" : "text-text-muted"
                    )}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-small text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
