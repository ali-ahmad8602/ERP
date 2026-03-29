import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus, Mail, Loader2, AlertCircle, CheckCircle2, Trash2,
  Clock, X, Copy, Check, Building2,
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import * as invitesApi from '../api/invites'
import { getDepartments } from '../api/boards'

const ORG_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'org_admin', label: 'Org Admin' },
  { value: 'top_management', label: 'Top Management' },
]

const DEPT_ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'dept_head', label: 'Dept Head' },
  { value: 'guest', label: 'Guest' },
]

const statusBadge = {
  pending: { bg: 'bg-amber/10', text: 'text-amber', label: 'Pending' },
  accepted: { bg: 'bg-accent-emerald/10', text: 'text-accent-emerald', label: 'Accepted' },
  expired: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Expired' },
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} title="Copy invite link" className="p-1 rounded-lg hover:bg-glass-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer">
      {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all'

export default function InvitesPage() {
  const [invites, setInvites] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  // Form state
  const [email, setEmail] = useState('')
  const [orgRole, setOrgRole] = useState('user')
  const [selectedDepts, setSelectedDepts] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [revokingId, setRevokingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [filter])

  async function loadData() {
    setLoading(true)
    try {
      const [invData, deptData] = await Promise.all([
        invitesApi.getInvites({ status: filter || undefined }),
        getDepartments(),
      ])
      setInvites(invData.invites)
      setDepartments(deptData.departments)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const addDept = () => {
    if (departments.length === 0) return
    setSelectedDepts([...selectedDepts, { department: departments[0]._id, role: 'member' }])
  }

  const updateDept = (idx, field, value) => {
    setSelectedDepts(selectedDepts.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }

  const removeDept = (idx) => {
    setSelectedDepts(selectedDepts.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await invitesApi.createInvite({
        email: email.trim(),
        orgRole,
        departments: selectedDepts,
      })
      setSuccess(`Invite sent to ${email.trim()}`)
      setEmail('')
      setOrgRole('user')
      setSelectedDepts([])
      // Add to list if viewing pending
      if (filter === 'pending' || !filter) {
        setInvites([data.invite, ...invites])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invite')
    } finally {
      setSaving(false)
    }
  }

  const handleRevoke = async (id) => {
    setRevokingId(id)
    try {
      await invitesApi.revokeInvite(id)
      setInvites(invites.map((inv) => inv._id === id ? { ...inv, status: 'expired' } : inv))
    } catch {
      setError('Failed to revoke invite')
    } finally {
      setRevokingId(null)
    }
  }

  const clientUrl = window.location.origin

  return (
    <motion.div
      className="min-h-screen bg-base px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary-light" strokeWidth={1.8} />
          Invite Users
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Invite team members to your workspace
        </p>
      </div>

      {/* Create Invite Form */}
      <GlassCard className="p-6 mb-6" glow="none">
        <h2 className="text-base font-heading font-semibold text-text-primary mb-4">
          Send Invitation
        </h2>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger mb-4">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            <button onClick={() => setError(null)} className="ml-auto shrink-0 cursor-pointer"><X className="w-3 h-3" /></button>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-xs text-accent-emerald mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />{success}
            <button onClick={() => setSuccess(null)} className="ml-auto shrink-0 cursor-pointer"><X className="w-3 h-3" /></button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com" disabled={saving}
                  className={`${inputClass} pl-10`} />
              </div>
            </div>

            {/* Org Role */}
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Organization Role</label>
              <select value={orgRole} onChange={(e) => setOrgRole(e.target.value)} disabled={saving} className={inputClass}>
                {ORG_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {/* Department assignments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Departments</label>
              <button type="button" onClick={addDept} disabled={saving || departments.length === 0}
                className="text-xs text-primary-light hover:text-primary-light/80 transition-colors cursor-pointer disabled:opacity-40">
                + Add department
              </button>
            </div>
            {selectedDepts.length === 0 ? (
              <p className="text-xs text-text-muted/50 py-2">No departments selected (optional)</p>
            ) : (
              <div className="space-y-2">
                {selectedDepts.map((sd, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select value={sd.department} onChange={(e) => updateDept(idx, 'department', e.target.value)}
                      disabled={saving} className={`${inputClass} flex-1`}>
                      {departments.map((d) => <option key={d._id} value={d._id}>{d.icon} {d.name}</option>)}
                    </select>
                    <select value={sd.role} onChange={(e) => updateDept(idx, 'role', e.target.value)}
                      disabled={saving} className={`${inputClass} w-32`}>
                      {DEPT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button type="button" onClick={() => removeDept(idx)} disabled={saving}
                      className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={!email.trim() || saving}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(4,84,252,0.3)] disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {saving ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </GlassCard>

      {/* Invites List */}
      <GlassCard className="overflow-hidden" glow="none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border">
          <h2 className="text-base font-heading font-semibold text-text-primary">Invitations</h2>
          <div className="flex gap-1 bg-glass rounded-lg p-0.5 border border-glass-border">
            {['pending', 'accepted', 'expired'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${filter === s ? 'bg-glass-hover text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <Loader2 className="w-5 h-5 text-text-muted animate-spin mx-auto" />
          </div>
        ) : invites.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-text-muted">No {filter} invitations</p>
          </div>
        ) : (
          <div className="divide-y divide-glass-border/50">
            <AnimatePresence mode="popLayout">
              {invites.map((invite) => {
                const badge = statusBadge[invite.status] || statusBadge.pending
                return (
                  <motion.div
                    key={invite._id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-glass-hover transition-colors"
                  >
                    <div className="p-2 rounded-xl bg-glass border border-glass-border shrink-0">
                      <Mail className="w-4 h-4 text-text-muted" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-text-primary truncate">{invite.email}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-glass border border-glass-border text-text-muted capitalize">
                          {invite.orgRole?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-muted">
                        {invite.departments?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {invite.departments.map((d) => d.department?.name || '').filter(Boolean).join(', ')}
                          </span>
                        )}
                        <span>Invited by {invite.invitedBy?.name || '—'}</span>
                        <span className="font-mono">{relativeTime(invite.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {invite.status === 'pending' && (
                        <>
                          <CopyButton text={`${clientUrl}/invite/${invite.token}`} />
                          <button
                            onClick={() => handleRevoke(invite._id)}
                            disabled={revokingId === invite._id}
                            title="Revoke"
                            className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer disabled:opacity-40">
                            {revokingId === invite._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
