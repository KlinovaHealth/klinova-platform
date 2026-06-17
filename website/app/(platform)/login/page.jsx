'use client'
import { Suspense } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import Image from 'next/image'

// Wrap in Suspense because useSearchParams requires it for static prerender
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [mode, setMode]         = useState('login') // 'login' | 'forgot'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')
  const [loading, setLoading]   = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') || '/dashboard'

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }

    const { data: profile } = await supabase
      .from('users')
      .select('force_password_change')
      .eq('id', data.user.id)
      .single()

    if (profile?.force_password_change) {
      router.push('/auth/first-login')
    } else {
      router.push(next)
    }
    setLoading(false)
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/first-login`,
    })
    if (err) { setError(err.message) } else {
      setInfo('Check your email — we sent a password reset link.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-border p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/klinova-logo-full.png" alt="Klinova" width={120} height={120}
            className="object-contain" />
        </div>

        {mode === 'login' ? (
          <>
            <h1 className="font-fraunces text-2xl text-ink text-center mb-1">Sign in</h1>
            <p className="text-center text-sm text-ink/60 mb-6">
              Use the credentials your administrator provided.
            </p>

            {error && <Alert type="error" msg={error} />}

            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Email">
                <input type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className={iCls} placeholder="you@klinova.co" />
              </Field>
              <Field label="Password">
                <input type="password" required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className={iCls} placeholder="••••••••" />
              </Field>
              <Btn loading={loading} label="Sign in" loadingLabel="Signing in…" />
            </form>

            <button onClick={() => { setMode('forgot'); setError('') }}
              className="w-full mt-4 text-sm text-kgreen hover:underline text-center">
              Forgot password?
            </button>
          </>
        ) : (
          <>
            <h1 className="font-fraunces text-2xl text-ink text-center mb-1">Reset password</h1>
            <p className="text-center text-sm text-ink/60 mb-6">
              Enter your email and we&apos;ll send a reset link.
            </p>

            {error && <Alert type="error" msg={error} />}
            {info  && <Alert type="success" msg={info} />}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Field label="Email">
                <input type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className={iCls} placeholder="you@klinova.co" />
              </Field>
              <Btn loading={loading} label="Send reset link" loadingLabel="Sending…" />
            </form>

            <button onClick={() => { setMode('login'); setError(''); setInfo('') }}
              className="w-full mt-4 text-sm text-kgreen hover:underline text-center">
              ← Back to sign in
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-ink/40">
        © {new Date().getFullYear()} Klinova · Lomé, Togo
      </p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      {children}
    </div>
  )
}

function Btn({ loading, label, loadingLabel }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-2.5 rounded-lg bg-kgreen text-white font-semibold text-sm
                 hover:bg-kgreen-dark active:scale-[0.98] disabled:opacity-50
                 focus:outline-none focus:ring-2 focus:ring-kgreen focus:ring-offset-2">
      {loading ? loadingLabel : label}
    </button>
  )
}

function Alert({ type, msg }) {
  return (
    <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${
      type === 'error'
        ? 'bg-red-50 border-red-200 text-red-700'
        : 'bg-kgreen-light border-kgreen/20 text-kgreen'
    }`}>{msg}</div>
  )
}

function LoadingCard() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-kgreen text-sm animate-pulse">Loading…</div>
    </div>
  )
}

const iCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink
              placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-kgreen
              focus:border-kgreen text-sm`
