"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LayoutGrid, Check, AlertTriangle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { inviteApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

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
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  // Invalid
  if (!valid) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-8">
        <div className="max-w-[400px] text-center">
          <div className="w-12 h-12 rounded-[14px] bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-danger" />
          </div>
          <h1 className="text-lg font-bold text-text-primary mb-2">Invite Not Valid</h1>
          <p className="text-sm text-text-secondary mb-6">{invalidReason}</p>
          <Link href="/login">
            <Button variant="primary" size="md">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Valid — registration form
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-8">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <LayoutGrid size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-bold text-text-primary">InvoiceMate</span>
        </div>

        {/* Welcome */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <UserPlus size={16} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">You&apos;re invited!</h1>
          </div>
          <p className="text-[13px] text-text-secondary">
            Complete your registration to join InvoiceMate Workspace.
          </p>
        </div>

        {/* Invite details */}
        <div className="bg-bg-surface border border-border rounded-card p-3.5 mb-5">
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2 font-bold">Your Invite</div>
          <div className="text-[13px] text-text-primary mb-1">{inviteInfo?.email}</div>
          <div className="text-xs text-text-muted">Role: {inviteInfo?.orgRole}</div>
          {inviteInfo?.departments && inviteInfo.departments.length > 0 && (
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {inviteInfo.departments.map((d, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md border"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            required
            autoFocus
          />

          <Input
            label="Email"
            value={inviteInfo?.email || ""}
            readOnly
            className="bg-bg-base text-text-muted cursor-not-allowed"
          />

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
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

            {/* Password rules */}
            {password.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {PASSWORD_RULES.map(rule => {
                  const pass = rule.test(password);
                  return (
                    <div key={rule.label} className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors",
                        pass ? "bg-accent" : "bg-bg-elevated border border-border"
                      )}>
                        {pass && <Check size={8} className="text-bg-base" strokeWidth={3} />}
                      </div>
                      <span className={cn(
                        "text-[11px] transition-colors",
                        pass ? "text-accent" : "text-text-muted"
                      )}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="text-xs bg-danger/10 border border-danger/20 text-danger px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

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
                <UserPlus size={14} />
                Join Workspace
              </>
            )}
          </Button>
        </form>

        <p className="text-center mt-5 text-xs text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
