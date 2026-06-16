'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase-client'
import DashboardLayout from '@/app/dashboards/DashboardLayout'

export default function AccountPage() {
  const { user, role, profile, loading } = useAuth()
  const [current, setCurrent]   = useState('')
  const [newPw, setNewPw]       = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [saving, setSaving]     = useState(false)

  async function handleChangePassword(e) {
    e.preventDefault()
    setError(''); setSuccess('')

    if (newPw.length < 8) { setError('New password must be at least 8 characters.'); return }
    if (newPw !== confirm) { setError('Passwords do not match.'); return }

    setSaving(true)
    const supabase = createClient()

    // Re-authenticate with current password first
    const { error: reAuthErr } = await supabase.auth.signInWithPassword({
      email: user.email, password: current,
    })
    if (reAuthErr) { setError('Current password is incorrect.'); setSaving(false); return }

    const { error: updateErr } = await supabase.auth.updateUser({ password: newPw })
    if (updateErr) { setError(updateErr.message); setSaving(false); return }

    setSuccess('Password updated successfully.')
    setCurrent(''); setNewPw(''); setConfirm('')
    setSaving(false)
  }

  if (loading) return <LoadingScreen />

  return (
    <DashboardLayout role={role}>
      <div className="max-w-lg mx-auto">
        <h2 className="font-fraunces text-2xl text-ink mb-1">Account settings</h2>
        <p className="text-sm text-ink/60 mb-8">{user?.email}</p>

        {/* Change password card */}
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-ink mb-4">Change password</h3>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-kgreen-light border border-kgreen/20 text-kgreen text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Current password</label>
              <input
                type="password" required autoComplete="current-password"
                value={current} onChange={e => setCurrent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
                           text-sm focus:outline-none focus:ring-2 focus:ring-kgreen focus:border-kgreen"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">New password</label>
              <input
                type="password" required minLength={8} autoComplete="new-password"
                value={newPw} onChange={e => setNewPw(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
                           text-sm focus:outline-none focus:ring-2 focus:ring-kgreen focus:border-kgreen"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Confirm new password</label>
              <input
                type="password" required minLength={8} autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
                           text-sm focus:outline-none focus:ring-2 focus:ring-kgreen focus:border-kgreen"
                placeholder="Repeat new password"
              />
            </div>
            <button
              type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-kgreen text-white font-semibold text-sm
                         hover:bg-kgreen-dark disabled:opacity-50 focus:ring-2 focus:ring-kgreen focus:ring-offset-2">
              {saving ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Profile info (read-only) */}
        <div className="bg-white rounded-xl border border-border shadow-card p-6 mt-4">
          <h3 className="font-semibold text-ink mb-4">Profile</h3>
          <div className="space-y-3 text-sm">
            <Row label="Name"  value={profile?.full_name || '—'} />
            <Row label="Email" value={user?.email || '—'} />
            <Row label="Role"  value={role ? role.charAt(0).toUpperCase() + role.slice(1) : '—'} />
          </div>
          <p className="mt-4 text-xs text-ink/40">
            To update your name or role, contact your administrator.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-20 text-ink/50 shrink-0">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-kgreen text-sm animate-pulse">Loading…</div>
    </div>
  )
}
