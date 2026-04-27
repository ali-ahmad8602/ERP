"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ChevronDown } from "lucide-react"

const roles = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "accountant", label: "Accountant" },
  { value: "viewer", label: "Viewer" },
]

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.role) {
      newErrors.role = "Please select a role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
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
            <h1 className="text-[16px] font-semibold text-[#fafafa] mb-1">Create account</h1>
            <p className="text-[11px] text-[#52525b]">Start using InvoiceMate ERP</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-[11px] font-medium text-[#a1a1aa]">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full h-8 px-3 bg-transparent border rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none transition-colors ${
                  errors.name
                    ? "border-[#ef4444] focus:border-[#ef4444]"
                    : "border-[#27272a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20"
                }`}
              />
              {errors.name && (
                <p className="text-[10px] text-[#ef4444]">{errors.name}</p>
              )}
            </div>

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
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full h-8 px-3 bg-transparent border rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none transition-colors ${
                  errors.email
                    ? "border-[#ef4444] focus:border-[#ef4444]"
                    : "border-[#27272a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20"
                }`}
              />
              {errors.email && (
                <p className="text-[10px] text-[#ef4444]">{errors.email}</p>
              )}
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
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`w-full h-8 px-3 pr-9 bg-transparent border rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none transition-colors ${
                    errors.password
                      ? "border-[#ef4444] focus:border-[#ef4444]"
                      : "border-[#27272a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20"
                  }`}
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
              {errors.password && (
                <p className="text-[10px] text-[#ef4444]">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-[11px] font-medium text-[#a1a1aa]">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={`w-full h-8 px-3 pr-9 bg-transparent border rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none transition-colors ${
                    errors.confirmPassword
                      ? "border-[#ef4444] focus:border-[#ef4444]"
                      : "border-[#27272a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3f3f46] hover:text-[#71717a] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-[#ef4444]">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selector */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="block text-[11px] font-medium text-[#a1a1aa]">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className={`w-full h-8 px-3 pr-8 bg-transparent border rounded-md text-[13px] appearance-none cursor-pointer focus:outline-none transition-colors ${
                    formData.role ? "text-[#fafafa]" : "text-[#3f3f46]"
                  } ${
                    errors.role
                      ? "border-[#ef4444] focus:border-[#ef4444]"
                      : "border-[#27272a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20"
                  }`}
                >
                  <option value="" disabled className="bg-[#0f0f11] text-[#3f3f46]">
                    Select your role
                  </option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value} className="bg-[#0f0f11] text-[#fafafa]">
                      {role.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3f3f46] pointer-events-none" strokeWidth={1.5} />
              </div>
              {errors.role && (
                <p className="text-[10px] text-[#ef4444]">{errors.role}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-8 bg-[#3b82f6] hover:bg-[#2563eb] text-[13px] font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Creating account..." : "Create account"}
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
