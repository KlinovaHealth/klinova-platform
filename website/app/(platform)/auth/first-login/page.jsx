'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Image from 'next/image'

export default function FirstLoginPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return
    }
    if (password !== confirm) {
      setError('Passwords do not match.'); return
    }

    setLoading(true)
    const supabase = createClient()

    // Update the password
    const { error: pwErr } = await supabase.auth.updateUser({ password })
    if (pwErr) { setError(pwErr.message); setLoading(false); return }

    // Clear the force_password_change flag
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('users')
      .update({ force_password_change: false })
      .eq('id', user.id)

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-border p-8">
        <div className="flex justify-center mb-6">
          <Image src="/klinova-logo-full.png" alt="Klinova" width={96} height={96}
            className="object-contain" />
        </div>

        <h1 className="font-fraunces text-2xl text-ink text-center mb-1">
          Set your password
        </h1>
        <p className="text-center text-sm text-ink/60 mb-6">
          Welcome to Klinova. Choose a strong password to secure your account.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">New password</label>
            <input
              type="password" required minLength={8} autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
                         placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-kgreen
                         focus:border-kgreen text-sm"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Confirm password</label>
            <input
              type="password" required minLength={8} autoComplete="new-password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
                         placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-kgreen
                         focus:border-kgreen text-sm"
              placeholder="Repeat password"
            />
          </div>

          {/* Strength hints */}
          <ul className="text-xs text-ink/50 space-y-0.5 pl-1">
            <li className={password.length >= 8 ? 'text-kgreen' : ''}>
              {password.length >= 8 ? '✓' : '○'} At least 8 characters
            </li>
            <li className={/[A-Z]/.test(password) ? 'text-kgreen' : ''}>
              {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
            </li>
            <li className={/[0-9]/.test(password) ? 'text-kgreen' : ''}>
              {/[0-9]/.test(password) ? '✓' : '○'} One number
            </li>
          </ul>

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-kgreen text-white font-semibold text-sm
                       hover:bg-kgreen-dark active:scale-[0.98] disabled:opacity-50
                       focus:outline-none focus:ring-2 focus:ring-kgreen focus:ring-offset-2">
            {loading ? 'Saving…' : 'Set password & continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
