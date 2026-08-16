'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

function logAuditEvent(action, userId, metadata) {
  fetch('/api/audit/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, userId, metadata }),
  }).catch(() => {})
}

function notifyWhatsApp(to, type, payload) {
  fetch('/api/whatsapp/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, type, payload }),
  }).catch(() => {})
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <AuthForm />
    </Suspense>
  )
}

/* ── Brand colours ─────────────────────────────── */
const C = { green: '#0E6B4F', deep: '#0A5440', ivory: '#F5EFE3', ink: '#15302A', mute: '#6E7F76', line: '#E7DECC', soft: '#E3EFE8', gold: '#D99A2B' }

/* ── Role config ────────────────────────────────── */
const ROLES = {
  patient: {
    label: 'Patient',
    icon: '🧑‍⚕️',
    heading: 'Create your account',
    sub: 'Get care in your language, on your phone.',
    color: C.green,
    fields: ['name', 'phone', 'email', 'password'],
  },
  doctor: {
    label: 'Doctor / Clinician',
    icon: '👨‍⚕️',
    heading: 'Apply as a doctor',
    sub: 'Join the Klinova network. Your application will be reviewed within 48 hours.',
    color: '#1A6B5A',
    fields: ['name', 'specialty', 'country', 'email', 'password'],
  },
  frontdesk: {
    label: 'Clinic / Hospital',
    icon: '🏥',
    heading: 'Register your clinic',
    sub: 'List your facility and start receiving pre-triaged referrals.',
    color: '#CF5A3C',
    fields: ['name', 'clinic_name', 'city', 'country', 'phone', 'email', 'password'],
  },
  pharmacist: {
    label: 'Pharmacy',
    icon: '💊',
    heading: 'Register your pharmacy',
    sub: 'Receive electronic prescriptions and list your stock on Klinova.',
    color: '#D99A2B',
    fields: ['name', 'pharmacy_name', 'city', 'country', 'phone', 'email', 'password'],
  },
  government: {
    label: 'Government / NGO',
    icon: '🏛️',
    heading: 'Register your organisation',
    sub: 'Access aggregate health data and outbreak intelligence for your region.',
    color: '#15302A',
    fields: ['name', 'org_name', 'country', 'email', 'password'],
  },
}

const ROLE_PICKER = [
  { key: 'patient',    icon: '🧑‍⚕️', label: 'I\'m a patient',          sub: 'Get care, consultations & prescriptions' },
  { key: 'doctor',     icon: '👨‍⚕️', label: 'I\'m a doctor',            sub: 'Join as a partner or teledoctor' },
  { key: 'frontdesk',  icon: '🏥', label: 'I manage a clinic',         sub: 'Register your clinic or hospital' },
  { key: 'pharmacist', icon: '💊', label: 'I run a pharmacy',          sub: 'Register and manage your stock' },
  { key: 'government', icon: '🏛️', label: 'Government / NGO',          sub: 'Access regional health data & intelligence', wide: true },
]

/* ── SVG logo mark (inline, always crisp) ─────── */
function KlinovaMark() {
  return (
    <svg width="42" height="42" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill={C.deep}/>
      <rect width="36" height="36" rx="10" fill="url(#klg)" opacity=".25"/>
      <path d="M11 9.5V26.5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M11.5 18L20.5 9.5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M11.5 18L20.5 26.5" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
      <circle cx="21.5" cy="18" r="2.2" fill={C.gold}/>
      <defs>
        <radialGradient id="klg" cx="0%" cy="0%" r="120%">
          <stop offset="0%" stopColor="white" stopOpacity=".35"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ── Main form ──────────────────────────────────── */
function AuthForm() {
  const searchParams = useSearchParams()
  const initialMode  = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const initialRole  = searchParams.get('role') || ''
  const next         = searchParams.get('next') || '/dashboard'

  const [mode, setMode]         = useState(initialMode)
  const [role, setRole]         = useState(ROLES[initialRole] ? initialRole : '')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [specialty, setSpecialty]       = useState('')
  const [clinicName, setClinicName]     = useState('')
  const [pharmacyName, setPharmacyName] = useState('')
  const [orgName, setOrgName]           = useState('')
  const [city, setCity]                 = useState('')
  const [country, setCountry]           = useState('')
  const [phone, setPhone]               = useState('')
  const [error, setError]   = useState('')
  const [info, setInfo]     = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function switchMode(m) { setMode(m); setError(''); setInfo('') }
  function pickRole(r)   { setRole(r); setError('') }

  /* ── Login ── */
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      logAuditEvent('auth.login_failed', null, { email, reason: err.message })
      setError(err.message); setLoading(false); return
    }
    logAuditEvent('auth.login_success', data.user.id, { email })
    const { data: profile } = await supabase.from('users').select('force_password_change').eq('id', data.user.id).single()
    router.push(profile?.force_password_change ? '/auth/first-login' : next)
    setLoading(false)
  }

  /* ── Signup ── */
  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const body = {
      email, password, full_name: name, role,
      ...(specialty    && { specialty }),
      ...(clinicName   && { clinic_name: clinicName }),
      ...(pharmacyName && { pharmacy_name: pharmacyName }),
      ...(orgName      && { org_name: orgName }),
      ...(city         && { city }),
      ...(country      && { country }),
      ...(phone        && { phone }),
    }
    const res  = await fetch('/api/auth/self-signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Something went wrong.'); setLoading(false); return }
    const supabase = createClient()
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
    if (signInErr) { setInfo('Account created! Please sign in.'); setMode('login'); setLoading(false); return }
    logAuditEvent('user.created', signInData?.user?.id, { email, role })
    if (role === 'patient' && phone) notifyWhatsApp(phone, 'welcome', { name, lang: 'fr' })
    router.push('/dashboard')
  }

  /* ── Forgot password ── */
  async function handleForgot(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/first-login` })
    if (err) { setError(err.message) } else { setInfo('Check your email — we sent a reset link.') }
    setLoading(false)
  }

  const cfg = ROLES[role]
  const accentColor = cfg?.color ?? C.green

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: mode === 'signup' && !role ? 480 : 400, background: '#fff', borderRadius: 22, boxShadow: '0 4px 40px -8px rgba(15,48,42,.12), 0 1px 4px rgba(0,0,0,.06)', border: `1px solid ${C.line}`, padding: '36px 36px 32px', transition: 'max-width .2s' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <a href="/" style={{ display: 'inline-block' }}>
            <img src="/klinova-logo-white.png" alt="Klinova" style={{ height: 72, width: 'auto', display: 'block' }} />
          </a>
        </div>

        {/* ── ROLE PICKER (signup + no role yet) ─────────────── */}
        {mode === 'signup' && !role && (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: C.ink, textAlign: 'center', marginBottom: 6 }}>
              Who are you signing up as?
            </h1>
            <p style={{ fontSize: 13, color: C.mute, textAlign: 'center', marginBottom: 24 }}>
              Your role shapes your experience — pick what applies to you.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {ROLE_PICKER.map(r => (
                <button key={r.key} onClick={() => pickRole(r.key)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 14px', borderRadius: 14, border: `1.5px solid ${C.line}`, background: C.ivory, cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s, box-shadow .15s', fontFamily: 'inherit', gridColumn: r.wide ? 'span 2' : undefined }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(14,107,79,.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = 'none' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{r.label}</span>
                  <span style={{ fontSize: 11.5, color: C.mute, lineHeight: 1.5 }}>{r.sub}</span>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: C.mute }}>Already have an account? </span>
              <button onClick={() => switchMode('login')} style={{ fontSize: 13, fontWeight: 700, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Sign in
              </button>
            </div>
          </>
        )}

        {/* ── SIGNUP FORM (role chosen) ───────────────────────── */}
        {mode === 'signup' && role && cfg && (
          <>
            {/* Back to picker */}
            <button onClick={() => setRole('')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.mute, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
              ← Change
              <span style={{ background: C.soft, color: accentColor, borderRadius: 999, padding: '2px 10px', fontWeight: 700, fontSize: 11 }}>
                {cfg.icon} {cfg.label}
              </span>
            </button>

            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
              {cfg.heading}
            </h1>
            <p style={{ fontSize: 13, color: C.mute, marginBottom: 22, lineHeight: 1.6 }}>{cfg.sub}</p>

            {error && <ErrBox msg={error} />}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cfg.fields.includes('name') && (
                <Fld label="Full name">
                  <Inp type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required autoComplete="name" color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('specialty') && (
                <Fld label="Specialty">
                  <Inp type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g. General Practice, Pediatrics" required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('org_name') && (
                <Fld label="Organisation name">
                  <Inp type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Ministry of Health, Togo" required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('clinic_name') && (
                <Fld label="Clinic / Hospital name">
                  <Inp type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="e.g. Clinique Saint-Jean" required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('pharmacy_name') && (
                <Fld label="Pharmacy name">
                  <Inp type="text" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} placeholder="e.g. Pharmacie Centrale" required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('city') && (
                <Fld label="City">
                  <Inp type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Lomé" required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('country') && (
                <Fld label="Country">
                  <select value={country} onChange={e => setCountry(e.target.value)} required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.ivory, color: country ? C.ink : C.mute, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                    <option value="">Select country</option>
                    {['Togo','Ghana','Benin','Côte d\'Ivoire','Burkina Faso','Nigeria','Senegal','Mali','Niger','Cameroon'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Fld>
              )}
              {cfg.fields.includes('phone') && (
                <Fld label="Phone number">
                  <Inp type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+228 9X XX XX XX" color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('email') && (
                <Fld label="Email">
                  <Inp type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('password') && (
                <Fld label="Password">
                  <Inp type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password" color={accentColor} />
                </Fld>
              )}
              <SubmitBtn loading={loading} color={accentColor}
                label={role === 'patient' ? 'Create account' : ['doctor','government'].includes(role) ? 'Submit application' : 'Register'}
                loadingLabel="Creating account…" />
            </form>

            <p style={{ fontSize: 11.5, color: C.mute, textAlign: 'center', marginTop: 14 }}>
              By creating an account you agree to our{' '}
              <a href="/privacy" style={{ color: C.green, fontWeight: 600 }}>Privacy Policy</a>.
            </p>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 13, color: C.mute }}>Already have an account? </span>
              <button onClick={() => switchMode('login')} style={{ fontSize: 13, fontWeight: 700, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
            </div>
          </>
        )}

        {/* ── LOGIN ───────────────────────────────────────────── */}
        {mode === 'login' && (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: C.ink, textAlign: 'center', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 13, color: C.mute, textAlign: 'center', marginBottom: 24 }}>
              Access your Klinova dashboard.
            </p>

            {error && <ErrBox msg={error} />}
            {info  && <OkBox  msg={info} />}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Fld label="Email">
                <Inp type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" color={C.green} />
              </Fld>
              <Fld label="Password">
                <Inp type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" color={C.green} />
              </Fld>
              <SubmitBtn loading={loading} color={C.green} label="Sign in" loadingLabel="Signing in…" />
            </form>

            <button onClick={() => switchMode('forgot')}
              style={{ width: '100%', marginTop: 12, fontSize: 13, color: C.green, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Forgot password?
            </button>

            <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 20, paddingTop: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: C.mute, marginBottom: 10 }}>Don&apos;t have an account?</p>
              <button onClick={() => { setRole(''); switchMode('signup') }}
                style={{ fontSize: 13.5, fontWeight: 700, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Create a free account →
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD ────────────────────────────────── */}
        {mode === 'forgot' && (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: C.ink, textAlign: 'center', marginBottom: 6 }}>
              Reset your password
            </h1>
            <p style={{ fontSize: 13, color: C.mute, textAlign: 'center', marginBottom: 24 }}>
              Enter your email and we&apos;ll send a reset link.
            </p>

            {error && <ErrBox msg={error} />}
            {info  && <OkBox  msg={info} />}

            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Fld label="Email">
                <Inp type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" color={C.green} />
              </Fld>
              <SubmitBtn loading={loading} color={C.green} label="Send reset link" loadingLabel="Sending…" />
            </form>

            <button onClick={() => switchMode('login')}
              style={{ width: '100%', marginTop: 12, fontSize: 13, color: C.mute, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back to sign in
            </button>
          </>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: C.mute }}>
        © {new Date().getFullYear()} Klinova · Lomé, Togo
      </p>
    </div>
  )
}

/* ── Shared components ──────────────────────────── */

function Fld({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#15302A', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Inp({ color, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
        border: `1.5px solid ${focused ? color : '#E7DECC'}`,
        background: '#F5EFE3', color: '#15302A', fontFamily: 'inherit',
        outline: 'none', transition: 'border-color .15s',
        boxShadow: focused ? `0 0 0 3px ${color}22` : 'none',
      }} />
  )
}

function SubmitBtn({ loading, label, loadingLabel, color }) {
  return (
    <button type="submit" disabled={loading}
      style={{
        width: '100%', padding: '12px 0', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        background: loading ? '#a0a0a0' : color, color: '#fff', fontWeight: 700, fontSize: 14.5,
        fontFamily: 'inherit', transition: 'background .15s, transform .1s', marginTop: 4,
        boxShadow: `0 6px 20px -6px ${color}99`,
      }}>
      {loading ? loadingLabel : label}
    </button>
  )
}

function ErrBox({ msg }) {
  return <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16 }}>{msg}</div>
}

function OkBox({ msg }) {
  return <div style={{ background: '#E3EFE8', border: '1px solid #86EFAC', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#0A5440', marginBottom: 16 }}>{msg}</div>
}

function LoadingCard() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5EFE3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#0E6B4F', fontSize: 14 }}>Loading…</span>
    </div>
  )
}
