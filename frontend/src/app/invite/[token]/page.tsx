"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { inviteApi } from "@/lib/api"

export default function InviteAcceptPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<{ email?: string; orgName?: string }>({})
  const [validateError, setValidateError] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function validate() {
      try {
        const data = await inviteApi.validate(token)
        setValid(data.valid)
        setInviteInfo({ email: data.email, orgName: data.orgName })
      } catch (err: any) {
        setValid(false)
        setValidateError(err.message || "Invalid or expired invite link")
      } finally {
        setValidating(false)
      }
    }
    validate()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const form = e.target as HTMLFormElement
    const name = (form.elements.namedItem("name") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    try {
      const data = await inviteApi.accept(token, { name, password })
      localStorage.setItem("token", data.token)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to accept invite")
    } finally {
      setIsLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="w-full max-w-[380px]">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-7 h-7 bg-[#3b82f6] rounded-md flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">IM</span>
            </div>
            <span className="text-[14px] font-semibold text-[#fafafa]">InvoiceMate</span>
          </div>
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-lg p-6">
            <p className="text-[13px] text-[#52525b] text-center">Validating invite...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="w-full max-w-[380px]">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-7 h-7 bg-[#3b82f6] rounded-md flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">IM</span>
            </div>
            <span className="text-[14px] font-semibold text-[#fafafa]">InvoiceMate</span>
          </div>
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-lg p-6">
            <div className="mb-4 px-3 py-2 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20">
              <p className="text-[11px] text-[#ef4444]">
                {validateError || "This invite link is invalid or has expired."}
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full h-8 bg-[#3b82f6] hover:bg-[#2563eb] text-[13px] font-medium text-white rounded-md transition-colors text-center leading-8"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-7 h-7 bg-[#3b82f6] rounded-md flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">IM</span>
          </div>
          <span className="text-[14px] font-semibold text-[#fafafa]">InvoiceMate</span>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f11] border border-[#27272a] rounded-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[16px] font-semibold text-[#fafafa] mb-1">Accept Invite</h1>
            <p className="text-[11px] text-[#52525b]">
              {inviteInfo.orgName
                ? `You've been invited to join ${inviteInfo.orgName}`
                : "Complete your account setup"}
            </p>
            {inviteInfo.email && (
              <p className="text-[11px] text-[#71717a] mt-1">{inviteInfo.email}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20">
              <p className="text-[11px] text-[#ef4444]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-[11px] font-medium text-[#a1a1aa]">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
                className="w-full h-8 px-3 bg-transparent border border-[#27272a] rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[11px] font-medium text-[#a1a1aa]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className="w-full h-8 px-3 pr-9 bg-transparent border border-[#27272a] rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3f3f46] hover:text-[#71717a] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-8 bg-[#3b82f6] hover:bg-[#2563eb] text-[13px] font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Setting up..." : "Accept & Join"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-[#52525b]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#52525b] hover:text-[#3b82f6] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
