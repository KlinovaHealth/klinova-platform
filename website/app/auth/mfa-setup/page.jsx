'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const C = { green: '#0E6B4F', deep: '#0A5440', ivory: '#F5EFE3', ink: '#15302A', mute: '#6E7F76', line: '#E7DECC', gold: '#D99A2B' }
const display = "'Fraunces', Georgia, serif"
const ui      = "'Plus Jakarta Sans', system-ui, sans-serif"

export default function MFASetup() {
  const router  = useRouter()
  const supabase = createClient()

  const [step, setStep]       = useState('init') // init | enroll | verify | done
  const [qrCode, setQrCode]   = useState('')
  const [secret, setSecret]   = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already enrolled
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find(f => f.status === 'verified')
      if (verified) { router.replace('/dashboard'); return }
      setStep('enroll')
      startEnrollment()
    })
  }, [])

  async function startEnrollment() {
    setLoading(true)
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Klinova' })
    if (err) { setError(err.message); setLoading(false); return }
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
    setFactorId(data.id)
    setLoading(false)
  }

  async function verifyCode(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId })
    if (cErr) { setError(cErr.message); setLoading(false); return }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code })
    if (vErr) { setError('Invalid code — try again.'); setLoading(false); return }
    setStep('done')
    setTimeout(() => router.replace('/dashboard'), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: ui }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 22, boxShadow: '0 4px 40px -8px rgba(15,48,42,.12)', border: `1px solid ${C.line}`, padding: '36px 36px 32px' }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <a href="/"><img src="/klinova-logo-white.png" alt="Klinova" style={{ height: 64, width: 'auto' }} /></a>
        </div>

        {step === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h1 style={{ fontFamily: display, fontSize: 22, color: C.ink, marginBottom: 8 }}>MFA enabled</h1>
            <p style={{ fontSize: 13, color: C.mute }}>Redirecting to your dashboard…</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, color: C.ink, textAlign: 'center', marginBottom: 6 }}>
              Set up two-factor authentication
            </h1>
            <p style={{ fontSize: 13, color: C.mute, textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
              Your role requires MFA. Scan the QR code with Google Authenticator, Authy, or any TOTP app.
            </p>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {loading && !qrCode && (
              <p style={{ textAlign: 'center', color: C.mute, fontSize: 13 }}>Generating QR code…</p>
            )}

            {qrCode && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <img src={qrCode} alt="MFA QR code" style={{ width: 180, height: 180, border: `1px solid ${C.line}`, borderRadius: 12, padding: 8 }} />
                </div>

                <p style={{ fontSize: 11, color: C.mute, textAlign: 'center', marginBottom: 4 }}>
                  Can't scan? Enter this key manually:
                </p>
                <p style={{ fontSize: 12, fontFamily: 'monospace', background: '#F5EFE3', borderRadius: 8, padding: '8px 12px', textAlign: 'center', wordBreak: 'break-all', marginBottom: 20, color: C.ink }}>
                  {secret}
                </p>

                <form onSubmit={verifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
                      6-digit code from your app
                    </label>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                      value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000" required autoComplete="one-time-code"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.ivory, color: C.ink, fontFamily: ui, fontSize: 20, textAlign: 'center', letterSpacing: 6, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button type="submit" disabled={loading || code.length !== 6}
                    style={{ width: '100%', padding: '12px 0', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading || code.length !== 6 ? '#a0a0a0' : C.green, color: '#fff', fontWeight: 700, fontSize: 14.5, fontFamily: ui }}>
                    {loading ? 'Verifying…' : 'Enable MFA'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
