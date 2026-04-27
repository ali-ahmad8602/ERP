"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const login = useAuthStore((s) => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    try {
      await login(email, password)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-[16px] font-semibold text-[#fafafa] mb-1">Welcome back</h1>
            <p className="text-[11px] text-[#52525b]">Sign in to InvoiceMate</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20">
              <p className="text-[11px] text-[#ef4444]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] font-medium text-[#a1a1aa]">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                required
                className="w-full h-8 px-3 bg-transparent border border-[#27272a] rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[11px] font-medium text-[#a1a1aa]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-[#52525b] hover:text-[#3b82f6] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  autoComplete="current-password"
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

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-[#27272a] bg-transparent accent-[#3b82f6] cursor-pointer"
              />
              <label htmlFor="remember" className="text-[11px] text-[#71717a] cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-8 bg-[#3b82f6] hover:bg-[#2563eb] text-[13px] font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-[#52525b]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#52525b] hover:text-[#3b82f6] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
