"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LayoutGrid, Check, AlertTriangle, UserPlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { inviteApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  // Invalid
  if (!valid) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <LayoutGrid size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">InvoiceMate</span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={26} className="text-danger" />
          </div>
          <h1 className="text-[22px] font-extrabold text-text-primary tracking-tight mb-2">
            Invite Not Valid
          </h1>
          <p className="text-[15px] text-text-secondary mb-8">{invalidReason}</p>
          <Link href="/login">
            <Button variant="primary" size="lg" className="px-8">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Valid — registration form
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">InvoiceMate</span>
        </div>

        {/* Welcome */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <UserPlus size={20} className="text-primary" />
          <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight">
            You&apos;re invited!
          </h1>
        </div>
        <p className="text-[15px] text-text-secondary mb-8">
          Complete your registration to join InvoiceMate Workspace.
        </p>

        {/* Invite details card */}
        <div className="bg-black/[0.03] dark:bg-white/[0.06] rounded-2xl p-5 mb-7">
          <div className="text-[11px] text-text-muted uppercase tracking-widest font-bold mb-3">Your Invite</div>
          <div className="text-[15px] font-medium text-text-primary mb-1">{inviteInfo?.email}</div>
          <div className="text-[13px] text-text-secondary">Role: {inviteInfo?.orgRole}</div>
          {inviteInfo?.departments && inviteInfo.departments.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {inviteInfo.departments.map((d, i) => (
                <span
                  key={i}
                  className="text-[12px] px-2.5 py-1 rounded-lg border font-medium"
                  style={{
                    background: `${d.department.color}14`,
                    color: d.department.color,
                    borderColor: `${d.department.color}30`,
                  }}
                >
                  {d.department.icon} {d.department.name} ({d.role})
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-[13px] font-medium text-danger">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            required
            autoFocus
          />

          <Input
            label="Email"
            value={inviteInfo?.email || ""}
            readOnly
            className="bg-black/[0.03] dark:bg-white/[0.06] text-text-muted cursor-not-allowed"
          />

          {/* Password with eye toggle */}
          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
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

            {/* Password rules */}
            {password.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {PASSWORD_RULES.map(rule => {
                  const pass = rule.test(password);
                  return (
                    <div key={rule.label} className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                        pass ? "bg-info" : "bg-black/[0.06] dark:bg-white/10 border border-border"
                      )}>
                        {pass && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={cn(
                        "text-[13px] transition-colors",
                        pass ? "text-info font-medium" : "text-text-muted"
                      )}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={!name.trim() || password.length < 8 || submitting}
            className="w-full mt-1"
          >
            {submitting ? "Creating account..." : (
              <>
                <UserPlus size={16} />
                Join Workspace
              </>
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-[13px] text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
