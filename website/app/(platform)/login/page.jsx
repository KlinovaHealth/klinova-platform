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

/* ── Translations ───────────────────────────────── */
const T = {
  en: {
    picker_title: 'Who are you signing up as?',
    picker_sub: 'Your role shapes your experience; pick what applies to you.',
    already_account: 'Already have an account?',
    sign_in: 'Sign in',

    role_patient_label: "I'm a patient",
    role_patient_sub: 'Get care, consultations & prescriptions',
    role_doctor_label: "I'm a doctor",
    role_doctor_sub: 'Join as a partner or teledoctor',
    role_frontdesk_label: 'I manage a clinic',
    role_frontdesk_sub: 'Register your clinic or hospital',
    role_pharmacist_label: 'I run a pharmacy',
    role_pharmacist_sub: 'Register and manage your stock',
    role_government_label: 'Government / NGO',
    role_government_sub: 'Access regional health data & intelligence',

    patient_label: 'Patient',
    doctor_label: 'Doctor / Clinician',
    frontdesk_label: 'Clinic / Hospital',
    pharmacist_label: 'Pharmacy',
    government_label: 'Government / NGO',

    patient_heading: 'Create your account',
    patient_sub: 'Get care in your language, on your phone.',
    doctor_heading: 'Apply as a doctor',
    doctor_sub: 'Join the Klinova network. Your application will be reviewed within 48 hours.',
    frontdesk_heading: 'Register your clinic',
    frontdesk_sub: 'List your facility and start receiving pre-triaged referrals.',
    pharmacist_heading: 'Register your pharmacy',
    pharmacist_sub: 'Receive electronic prescriptions and list your stock on Klinova.',
    government_heading: 'Register your organisation',
    government_sub: 'Access aggregate health data and outbreak intelligence for your region.',

    change: '← Change',

    fld_full_name: 'Full name',
    fld_specialty: 'Specialty',
    fld_org_name: 'Organisation name',
    fld_clinic_name: 'Clinic / Hospital name',
    fld_pharmacy_name: 'Pharmacy name',
    fld_city: 'City',
    fld_country: 'Country',
    fld_phone: 'Phone number',
    fld_email: 'Email',
    fld_password: 'Password',

    ph_name: 'Your name',
    ph_specialty: 'e.g. General Practice, Pediatrics',
    ph_org_name: 'e.g. Ministry of Health, Togo',
    ph_clinic_name: 'e.g. Clinique Saint-Jean',
    ph_pharmacy_name: 'e.g. Pharmacie Centrale',
    ph_city: 'e.g. Lomé',
    ph_country: 'Select country',
    ph_email: 'you@example.com',
    ph_password: 'Min. 8 characters',

    btn_create_account: 'Create account',
    btn_submit_application: 'Submit application',
    btn_register: 'Register',
    btn_creating: 'Creating account…',

    privacy: 'By creating an account you agree to our',
    privacy_link: 'Privacy Policy',

    login_title: 'Welcome back',
    login_sub: 'Access your Klinova dashboard.',
    btn_sign_in: 'Sign in',
    btn_signing_in: 'Signing in…',
    forgot_password: 'Forgot password?',
    no_account: "Don't have an account?",
    create_free: 'Create a free account →',

    forgot_title: 'Reset your password',
    forgot_sub: "Enter your email and we'll send a reset link.",
    btn_send_reset: 'Send reset link',
    btn_sending: 'Sending…',
    back_to_signin: '← Back to sign in',

    account_created: 'Account created! Please sign in.',
    reset_sent: 'Check your email — we sent a reset link.',
  },
  fr: {
    picker_title: 'Vous inscrivez-vous en tant que ?',
    picker_sub: 'Votre rôle façonne votre expérience ; choisissez ce qui vous correspond.',
    already_account: 'Vous avez déjà un compte ?',
    sign_in: 'Se connecter',

    role_patient_label: 'Je suis patient(e)',
    role_patient_sub: 'Obtenez des soins, consultations et ordonnances',
    role_doctor_label: 'Je suis médecin',
    role_doctor_sub: 'Rejoignez en tant que partenaire ou télémédecin',
    role_frontdesk_label: 'Je gère une clinique',
    role_frontdesk_sub: 'Enregistrez votre clinique ou hôpital',
    role_pharmacist_label: 'Je gère une pharmacie',
    role_pharmacist_sub: 'Enregistrez et gérez votre stock',
    role_government_label: 'Gouvernement / ONG',
    role_government_sub: "Accédez aux données de santé régionales et à l'intelligence",

    patient_label: 'Patient',
    doctor_label: 'Médecin / Clinicien',
    frontdesk_label: 'Clinique / Hôpital',
    pharmacist_label: 'Pharmacie',
    government_label: 'Gouvernement / ONG',

    patient_heading: 'Créez votre compte',
    patient_sub: 'Recevez des soins dans votre langue, sur votre téléphone.',
    doctor_heading: 'Postuler en tant que médecin',
    doctor_sub: 'Rejoignez le réseau Klinova. Votre candidature sera examinée dans les 48 heures.',
    frontdesk_heading: 'Enregistrez votre clinique',
    frontdesk_sub: 'Référencez votre établissement et commencez à recevoir des référés pré-triés.',
    pharmacist_heading: 'Enregistrez votre pharmacie',
    pharmacist_sub: 'Recevez des ordonnances électroniques et référencez votre stock sur Klinova.',
    government_heading: 'Enregistrez votre organisation',
    government_sub: "Accédez aux données de santé agrégées et à l'intelligence épidémique pour votre région.",

    change: '← Changer',

    fld_full_name: 'Nom complet',
    fld_specialty: 'Spécialité',
    fld_org_name: "Nom de l'organisation",
    fld_clinic_name: 'Nom de la clinique / hôpital',
    fld_pharmacy_name: 'Nom de la pharmacie',
    fld_city: 'Ville',
    fld_country: 'Pays',
    fld_phone: 'Numéro de téléphone',
    fld_email: 'E-mail',
    fld_password: 'Mot de passe',

    ph_name: 'Votre nom',
    ph_specialty: 'ex. Médecine générale, Pédiatrie',
    ph_org_name: 'ex. Ministère de la Santé, Togo',
    ph_clinic_name: 'ex. Clinique Saint-Jean',
    ph_pharmacy_name: 'ex. Pharmacie Centrale',
    ph_city: 'ex. Lomé',
    ph_country: 'Sélectionnez un pays',
    ph_email: 'vous@exemple.com',
    ph_password: '8 caractères minimum',

    btn_create_account: 'Créer un compte',
    btn_submit_application: 'Soumettre la candidature',
    btn_register: "S'inscrire",
    btn_creating: 'Création du compte…',

    privacy: 'En créant un compte, vous acceptez notre',
    privacy_link: 'Politique de confidentialité',

    login_title: 'Bon retour',
    login_sub: 'Accédez à votre tableau de bord Klinova.',
    btn_sign_in: 'Se connecter',
    btn_signing_in: 'Connexion…',
    forgot_password: 'Mot de passe oublié ?',
    no_account: "Vous n'avez pas de compte ?",
    create_free: 'Créer un compte gratuit →',

    forgot_title: 'Réinitialisez votre mot de passe',
    forgot_sub: 'Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.',
    btn_send_reset: 'Envoyer le lien',
    btn_sending: 'Envoi…',
    back_to_signin: '← Retour à la connexion',

    account_created: 'Compte créé ! Veuillez vous connecter.',
    reset_sent: 'Vérifiez votre e-mail — nous avons envoyé un lien de réinitialisation.',
  },
}

/* ── Role config ────────────────────────────────── */
const ROLES = {
  patient:    { icon: '🧑‍⚕️', color: C.green,    fields: ['name', 'phone', 'email', 'password'] },
  doctor:     { icon: '👨‍⚕️', color: '#1A6B5A',  fields: ['name', 'specialty', 'country', 'email', 'password'] },
  frontdesk:  { icon: '🏥',  color: '#CF5A3C',  fields: ['name', 'clinic_name', 'city', 'country', 'phone', 'email', 'password'] },
  pharmacist: { icon: '💊',  color: '#D99A2B',  fields: ['name', 'pharmacy_name', 'city', 'country', 'phone', 'email', 'password'] },
  government: { icon: '🏛️', color: '#15302A',  fields: ['name', 'org_name', 'country', 'email', 'password'] },
}

const ROLE_PICKER_KEYS = [
  { key: 'patient',    wide: false },
  { key: 'doctor',     wide: false },
  { key: 'frontdesk',  wide: false },
  { key: 'pharmacist', wide: false },
  { key: 'government', wide: true  },
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

  const [lang, setLang]         = useState('en')
  const t = k => T[lang]?.[k] ?? T.en[k]

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
    if (signInErr) { setInfo(t('account_created')); setMode('login'); setLoading(false); return }
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
    if (err) { setError(err.message) } else { setInfo(t('reset_sent')) }
    setLoading(false)
  }

  const cfg = ROLES[role]
  const accentColor = cfg?.color ?? C.green

  const LangPill = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
      {['en', 'fr'].map(l => (
        <button key={l} onClick={() => setLang(l)}
          style={{
            padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s',
            background: lang === l ? C.green : 'transparent',
            color: lang === l ? '#fff' : C.mute,
            border: `1.5px solid ${lang === l ? C.green : C.line}`,
          }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: mode === 'signup' && !role ? 480 : 400, background: '#fff', borderRadius: 22, boxShadow: '0 4px 40px -8px rgba(15,48,42,.12), 0 1px 4px rgba(0,0,0,.06)', border: `1px solid ${C.line}`, padding: '36px 36px 32px', transition: 'max-width .2s' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <a href="/" style={{ display: 'inline-block' }}>
            <img src="/klinova-logo-white.png" alt="Klinova" style={{ height: 72, width: 'auto', display: 'block' }} />
          </a>
        </div>

        {/* Lang toggle */}
        <LangPill />

        {/* ── ROLE PICKER (signup + no role yet) ─────────────── */}
        {mode === 'signup' && !role && (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: C.ink, textAlign: 'center', marginBottom: 6 }}>
              {t('picker_title')}
            </h1>
            <p style={{ fontSize: 13, color: C.mute, textAlign: 'center', marginBottom: 24 }}>
              {t('picker_sub')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {ROLE_PICKER_KEYS.map(r => (
                <button key={r.key} onClick={() => pickRole(r.key)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 14px', borderRadius: 14, border: `1.5px solid ${C.line}`, background: C.ivory, cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s, box-shadow .15s', fontFamily: 'inherit', gridColumn: r.wide ? 'span 2' : undefined }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(14,107,79,.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = 'none' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{t(`role_${r.key}_label`)}</span>
                  <span style={{ fontSize: 11.5, color: C.mute, lineHeight: 1.5 }}>{t(`role_${r.key}_sub`)}</span>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: C.mute }}>{t('already_account')} </span>
              <button onClick={() => switchMode('login')} style={{ fontSize: 13, fontWeight: 700, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t('sign_in')}
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
              {t('change')}
              <span style={{ background: C.soft, color: accentColor, borderRadius: 999, padding: '2px 10px', fontWeight: 700, fontSize: 11 }}>
                {cfg.icon} {t(`${role}_label`)}
              </span>
            </button>

            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
              {t(`${role}_heading`)}
            </h1>
            <p style={{ fontSize: 13, color: C.mute, marginBottom: 22, lineHeight: 1.6 }}>{t(`${role}_sub`)}</p>

            {error && <ErrBox msg={error} />}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cfg.fields.includes('name') && (
                <Fld label={t('fld_full_name')}>
                  <Inp type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('ph_name')} required autoComplete="name" color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('specialty') && (
                <Fld label={t('fld_specialty')}>
                  <Inp type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder={t('ph_specialty')} required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('org_name') && (
                <Fld label={t('fld_org_name')}>
                  <Inp type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder={t('ph_org_name')} required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('clinic_name') && (
                <Fld label={t('fld_clinic_name')}>
                  <Inp type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder={t('ph_clinic_name')} required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('pharmacy_name') && (
                <Fld label={t('fld_pharmacy_name')}>
                  <Inp type="text" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} placeholder={t('ph_pharmacy_name')} required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('city') && (
                <Fld label={t('fld_city')}>
                  <Inp type="text" value={city} onChange={e => setCity(e.target.value)} placeholder={t('ph_city')} required color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('country') && (
                <Fld label={t('fld_country')}>
                  <select value={country} onChange={e => setCountry(e.target.value)} required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.ivory, color: country ? C.ink : C.mute, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                    <option value="">{t('ph_country')}</option>
                    {['Togo','Ghana','Benin','Côte d\'Ivoire','Burkina Faso','Nigeria','Senegal','Mali','Niger','Cameroon'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Fld>
              )}
              {cfg.fields.includes('phone') && (
                <Fld label={t('fld_phone')}>
                  <Inp type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+228 9X XX XX XX" color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('email') && (
                <Fld label={t('fld_email')}>
                  <Inp type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('ph_email')} required autoComplete="email" color={accentColor} />
                </Fld>
              )}
              {cfg.fields.includes('password') && (
                <Fld label={t('fld_password')}>
                  <Inp type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('ph_password')} required minLength={8} autoComplete="new-password" color={accentColor} />
                </Fld>
              )}
              <SubmitBtn loading={loading} color={accentColor}
                label={role === 'patient' ? t('btn_create_account') : ['doctor','government'].includes(role) ? t('btn_submit_application') : t('btn_register')}
                loadingLabel={t('btn_creating')} />
            </form>

            <p style={{ fontSize: 11.5, color: C.mute, textAlign: 'center', marginTop: 14 }}>
              {t('privacy')}{' '}
              <a href="/privacy" style={{ color: C.green, fontWeight: 600 }}>{t('privacy_link')}</a>.
            </p>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 13, color: C.mute }}>{t('already_account')} </span>
              <button onClick={() => switchMode('login')} style={{ fontSize: 13, fontWeight: 700, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t('sign_in')}</button>
            </div>
          </>
        )}

        {/* ── LOGIN ───────────────────────────────────────────── */}
        {mode === 'login' && (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: C.ink, textAlign: 'center', marginBottom: 6 }}>
              {t('login_title')}
            </h1>
            <p style={{ fontSize: 13, color: C.mute, textAlign: 'center', marginBottom: 24 }}>
              {t('login_sub')}
            </p>

            {error && <ErrBox msg={error} />}
            {info  && <OkBox  msg={info} />}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Fld label={t('fld_email')}>
                <Inp type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('ph_email')} required autoComplete="email" color={C.green} />
              </Fld>
              <Fld label={t('fld_password')}>
                <Inp type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" color={C.green} />
              </Fld>
              <SubmitBtn loading={loading} color={C.green} label={t('btn_sign_in')} loadingLabel={t('btn_signing_in')} />
            </form>

            <button onClick={() => switchMode('forgot')}
              style={{ width: '100%', marginTop: 12, fontSize: 13, color: C.green, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t('forgot_password')}
            </button>

            <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 20, paddingTop: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: C.mute, marginBottom: 10 }}>{t('no_account')}</p>
              <button onClick={() => { setRole(''); switchMode('signup') }}
                style={{ fontSize: 13.5, fontWeight: 700, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t('create_free')}
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD ────────────────────────────────── */}
        {mode === 'forgot' && (
          <>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: C.ink, textAlign: 'center', marginBottom: 6 }}>
              {t('forgot_title')}
            </h1>
            <p style={{ fontSize: 13, color: C.mute, textAlign: 'center', marginBottom: 24 }}>
              {t('forgot_sub')}
            </p>

            {error && <ErrBox msg={error} />}
            {info  && <OkBox  msg={info} />}

            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Fld label={t('fld_email')}>
                <Inp type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('ph_email')} required autoComplete="email" color={C.green} />
              </Fld>
              <SubmitBtn loading={loading} color={C.green} label={t('btn_send_reset')} loadingLabel={t('btn_sending')} />
            </form>

            <button onClick={() => switchMode('login')}
              style={{ width: '100%', marginTop: 12, fontSize: 13, color: C.mute, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t('back_to_signin')}
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
