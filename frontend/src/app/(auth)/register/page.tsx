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
    <div className="min-h-screen bg-bg-surface flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">InvoiceMate</span>
        </div>

        <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight mb-1.5">
          Create your account
        </h1>
        <p className="text-[15px] text-text-secondary mb-8">
          Join your team workspace on InvoiceMate ERP
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-[13px] font-medium text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Full Name"
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Ali Ahmad"
            required
          />

          <Input
            label="Work Email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@company.com"
            required
          />

          {/* Password with eye toggle */}
          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Create a strong password"
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-4 bottom-3.5 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="mt-3 space-y-1.5">
                {PASSWORD_RULES.map(rule => (
                  <div key={rule.label} className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                      rule.test(form.password) ? "bg-info" : "bg-black/[0.06] dark:bg-white/10 border border-border"
                    )}>
                      {rule.test(form.password) && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={cn(
                      "text-[13px] transition-colors",
                      rule.test(form.password) ? "text-info font-medium" : "text-text-muted"
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
            className="w-full mt-1"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-[13px] text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Sign in
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-[12px] text-text-muted leading-relaxed">
          By creating an account, you agree to our{" "}
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
  );
}
