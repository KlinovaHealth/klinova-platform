'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AccountContent({ user, role, profile }) {
  const { t } = useLanguage()
  const [current, setCurrent] = useState('')
  const [newPw, setNewPw]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving]   = useState(false)

  async function handleChangePassword(e) {
    e.preventDefault()
    setError(''); setSuccess('')

    if (newPw.length < 8) { setError(t('acct.errShort')); return }
    if (newPw !== confirm) { setError(t('acct.errMatch')); return }

    setSaving(true)
    const supabase = createClient()

    const { error: reAuthErr } = await supabase.auth.signInWithPassword({
      email: user.email, password: current,
    })
    if (reAuthErr) { setError(t('acct.errCurrent')); setSaving(false); return }

    const { error: updateErr } = await supabase.auth.updateUser({ password: newPw })
    if (updateErr) { setError(updateErr.message); setSaving(false); return }

    setSuccess(t('acct.successMsg'))
    setCurrent(''); setNewPw(''); setConfirm('')
    setSaving(false)
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-fraunces text-2xl text-ink mb-1">{t('acct.title')}</h2>
      <p className="text-sm text-ink/60 mb-8">{user?.email}</p>

      <div className="bg-white rounded-xl border border-border shadow-card p-6">
        <h3 className="font-semibold text-ink mb-4">{t('acct.changePassword')}</h3>

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
            <label className="block text-sm font-medium text-ink mb-1">{t('acct.currentPassword')}</label>
            <input
              type="password" required autoComplete="current-password"
              value={current} onChange={e => setCurrent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
                         text-sm focus:outline-none focus:ring-2 focus:ring-kgreen focus:border-kgreen"
              placeholder={t('acct.currentPh')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('acct.newPassword')}</label>
            <input
              type="password" required minLength={8} autoComplete="new-password"
              value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
                         text-sm focus:outline-none focus:ring-2 focus:ring-kgreen focus:border-kgreen"
              placeholder={t('acct.newPh')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('acct.confirmPassword')}</label>
            <input
              type="password" required minLength={8} autoComplete="new-password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
                         text-sm focus:outline-none focus:ring-2 focus:ring-kgreen focus:border-kgreen"
              placeholder={t('acct.confirmPh')}
            />
          </div>
          <button
            type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-kgreen text-white font-semibold text-sm
                       hover:bg-kgreen-dark disabled:opacity-50 focus:ring-2 focus:ring-kgreen focus:ring-offset-2">
            {saving ? t('acct.saving') : t('acct.updateBtn')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-card p-6 mt-4">
        <h3 className="font-semibold text-ink mb-4">{t('acct.profile')}</h3>
        <div className="space-y-3 text-sm">
          <Row label={t('acct.name')}  value={profile?.full_name || '—'} />
          <Row label={t('acct.email')} value={user?.email || '—'} />
          <Row label={t('acct.role')}  value={role ? t(`roles.${role}`) || role : '—'} />
        </div>
        <p className="mt-4 text-xs text-ink/40">{t('acct.contactAdmin')}</p>
      </div>
    </div>
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
