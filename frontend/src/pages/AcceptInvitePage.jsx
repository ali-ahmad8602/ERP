import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserPlus, User, Lock, Loader2, AlertCircle, CheckCircle2,
  Building2, ShieldCheck, XCircle,
} from 'lucide-react'
import * as invitesApi from '../api/invites'
import useAuthStore from '../store/useAuthStore'

const inputClass = 'w-full pl-10 pr-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.login)

  const [validating, setValidating] = useState(true)
  const [invite, setInvite] = useState(null)
  const [invalidReason, setInvalidReason] = useState(null)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    validateToken()
  }, [token])

  async function validateToken() {
    setValidating(true)
    try {
      const data = await invitesApi.validateInvite(token)
      if (data.valid) {
        setInvite(data)
      } else {
        setInvalidReason(data.reason || 'This invite is no longer valid')
      }
    } catch {
      setInvalidReason('Unable to validate invite. Please check the link.')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError('Name is required'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setSubmitting(true)
    try {
      const data = await invitesApi.acceptInvite(token, {
        name: name.trim(),
        password,
      })
      // Store token + user in auth store
      localStorage.setItem('token', data.token)
      useAuthStore.setState({ token: data.token, user: data.user })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 text-primary-light animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Validating invite...</p>
        </div>
      </div>
    )
  }

  // Invalid invite
  if (invalidReason) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danger/5 rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm relative z-10 text-center"
        >
          <div className="bg-surface/60 backdrop-blur-2xl border border-glass-border rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.4)] p-8">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-danger" />
            </div>
            <h2 className="text-lg font-heading font-bold text-text-primary mb-2">
              Invalid Invite
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {invalidReason}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-xl bg-glass border border-glass-border text-sm font-medium text-text-secondary hover:bg-glass-hover transition-all cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Valid invite — show registration form
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-text-primary tracking-tight">
            InvoiceMate
          </h1>
          <p className="text-sm text-text-muted mt-1">
            You've been invited to join the workspace
          </p>
        </div>

        <div className="bg-surface/60 backdrop-blur-2xl border border-glass-border rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Invite details banner */}
          <div className="px-6 py-4 bg-primary/5 border-b border-glass-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary-light" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{invite.email}</p>
                <p className="text-[11px] text-text-muted capitalize flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {invite.orgRole?.replace('_', ' ')}
                </p>
              </div>
            </div>
            {invite.departments?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {invite.departments.map((d, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-glass border border-glass-border text-text-secondary">
                    <Building2 className="w-3 h-3" />
                    {d.department?.name || '—'}
                    <span className="text-text-muted capitalize">({d.role})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
              </motion.div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" autoFocus disabled={submitting} className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters" autoComplete="new-password" disabled={submitting} className={inputClass} />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password" autoComplete="new-password" disabled={submitting} className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={!name.trim() || !password || submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_24px_rgba(4,84,252,0.35)] disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Creating account...' : 'Accept & Join'}
            </button>
          </form>

          <div className="px-6 py-3 border-t border-glass-border text-center">
            <p className="text-[11px] text-text-muted">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-primary-light hover:underline cursor-pointer">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
