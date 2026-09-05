'use client'
import { useState } from 'react'

const C = {
  ink:       '#15302A',
  green:     '#0E6B4F',
  greenDeep: '#0A5440',
  greenSoft: '#E3EFE8',
  ivory:     '#F5EFE3',
  sand:      '#EDE4D2',
  gold:      '#D99A2B',
  goldSoft:  '#F4E2BC',
  amber:     '#E0A23B',
  coral:     '#CF5A3C',
  mute:      '#6E7F76',
  line:      '#E7DECC',
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=co.klinova.app'
const APP_STORE_URL  = 'https://apps.apple.com/app/klinova/id6745274697'
const WHATSAPP_NUMBER = '18137860818'

const T = {
  en: {
    eyebrow:   'BORN IN AFRICA. BUILT FOR LIFE.',
    hero:      'Get the Klinova app',
    heroSub:   'See a doctor, get your prescription, and find nearby clinics in your language, on any phone.',
    android:   'Android',
    androidSub:'Available on Google Play',
    gplay:     'Google Play',
    ios:       'iOS (iPhone)',
    iosSub:    'Available on the App Store',
    appstore:  'App Store',
    qrScan:    'Scan to download',
    wa:        'WhatsApp Triage',
    waSoon:    'COMING SOON',
    waComing:  'Start a consultation via WhatsApp, launching soon, no smartphone required.',
    waDesc:    'Chat with a Klinova health assistant on WhatsApp, no app needed.',
    waOpen:    'Open WhatsApp',
    waQr:      'Scan to chat',
  },
  fr: {
    eyebrow:   'NÉ EN AFRIQUE. FAIT POUR LA VIE.',
    hero:      'Téléchargez l\'application Klinova',
    heroSub:   'Consultez un médecin, obtenez votre ordonnance et trouvez des cliniques proches dans votre langue, sur n\'importe quel téléphone.',
    android:   'Android',
    androidSub:'Disponible sur Google Play',
    gplay:     'Google Play',
    ios:       'iOS (iPhone)',
    iosSub:    'Disponible sur l\'App Store',
    appstore:  'App Store',
    qrScan:    'Scanner pour télécharger',
    wa:        'Triage WhatsApp',
    waSoon:    'BIENTÔT DISPONIBLE',
    waComing:  'Démarrez une consultation via WhatsApp, bientôt disponible, sans smartphone requis.',
    waDesc:    'Discutez avec un assistant santé Klinova sur WhatsApp, sans application.',
    waOpen:    'Ouvrir WhatsApp',
    waQr:      'Scanner pour discuter',
  },
}

export default function DownloadPage() {
  const [lang, setLang] = useState('en')
  const t = T[lang]

  const waMsg = encodeURIComponent(
    lang === 'fr'
      ? 'Bonjour Klinova, je souhaite consulter un médecin. Pouvez-vous m\'aider ?'
      : 'Hello Klinova, I\'d like to consult a doctor. Can you help me get started?'
  )
  const waLink = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}` : null

  const qrUrl = (data) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0A5440&bgcolor=F5EFE3&data=${encodeURIComponent(data)}`

  const toggleBtn = (l, label) => (
    <button
      key={l}
      onClick={() => setLang(l)}
      style={{
        padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: 13,
        background: lang === l ? '#fff' : 'transparent',
        color:      lang === l ? C.greenDeep : 'rgba(255,255,255,.65)',
        transition: 'all .15s',
      }}
    >{label}</button>
  )

  return (
    <main style={{ background: C.ivory, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.greenDeep, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/klinova-logo-green.jpg" alt="Klinova" height={44} style={{ display: 'block' }} />
        </a>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: 3 }}>
          {toggleBtn('en', 'EN')}
          {toggleBtn('fr', 'FR')}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            {t.eyebrow}
          </p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 600, color: C.ink, lineHeight: 1.15, margin: '0 0 16px' }}>
            {t.hero}
          </h1>
          <p style={{ fontSize: 16, color: C.mute, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>
            {t.heroSub}
          </p>
        </div>

        {/* Android */}
        <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: '28px 32px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={C.green}>
                <path d="M17.523 15.344 19.98 11 17.523 6.656A2 2 0 0 0 15.72 5.5H8.28a2 2 0 0 0-1.803 1.156L4.02 11l2.457 4.344A2 2 0 0 0 8.28 16.5h7.44a2 2 0 0 0 1.803-1.156z" opacity=".15"/>
                <path d="M3 11 6.5 5M21 11l-3.5-6M7.5 2.5 9 5.5M16.5 2.5 15 5.5M5 19l2-3.5M19 19l-2-3.5" stroke={C.green} strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 8v3l2 2" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>{t.android}</span>
            </div>
            <p style={{ fontSize: 13, color: C.mute, margin: '0 0 16px' }}>{t.androidSub}</p>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.greenDeep, color: '#fff', textDecoration: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 14V2l12 6-12 6z" fill="#fff"/>
              </svg>
              {t.gplay}
            </a>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={qrUrl(PLAY_STORE_URL)}
              alt="QR code for Google Play"
              width={100}
              height={100}
              style={{ borderRadius: 8, border: `1px solid ${C.line}` }}
            />
            <p style={{ fontSize: 11, color: C.mute, marginTop: 6 }}>{t.qrScan}</p>
          </div>
        </div>

        {/* iOS */}
        <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: '28px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C9 2 6.5 4.5 6.5 7.5c0 1.5.6 2.9 1.6 3.9C5.4 12.8 4 15.2 4 18c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4 0-2.8-1.4-5.2-4.1-6.6 1-1 1.6-2.4 1.6-3.9C17.5 4.5 15 2 12 2z"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>{t.ios}</span>
            </div>
            <p style={{ fontSize: 13, color: C.mute, margin: '0 0 16px' }}>{t.iosSub}</p>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.greenDeep, color: '#fff', textDecoration: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C9 2 6.5 4.5 6.5 7.5c0 1.5.6 2.9 1.6 3.9C5.4 12.8 4 15.2 4 18c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4 0-2.8-1.4-5.2-4.1-6.6 1-1 1.6-2.4 1.6-3.9C17.5 4.5 15 2 12 2z"/>
              </svg>
              {t.appstore}
            </a>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={qrUrl(APP_STORE_URL)}
              alt="QR code for App Store"
              width={100}
              height={100}
              style={{ borderRadius: 8, border: `1px solid ${C.line}` }}
            />
            <p style={{ fontSize: 11, color: C.mute, marginTop: 6 }}>{t.qrScan}</p>
          </div>
        </div>

        {/* WhatsApp */}
        <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 16, padding: '24px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fillOpacity=".2"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1B5E20' }}>{t.wa}</span>
            {!waLink && (
              <span style={{ background: C.goldSoft, color: C.amber, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>{t.waSoon}</span>
            )}
          </div>
          {waLink ? (
            <>
              <p style={{ fontSize: 13, color: '#2E7D32', margin: '0 0 16px' }}>{t.waDesc}</p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', textDecoration: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, marginBottom: 20 }}
              >
                {t.waOpen}
              </a>
              <div>
                <img
                  src={qrUrl(waLink)}
                  alt="WhatsApp QR code"
                  width={100}
                  height={100}
                  style={{ borderRadius: 8, border: '1px solid #A5D6A7' }}
                />
                <p style={{ fontSize: 11, color: '#66BB6A', marginTop: 6 }}>{t.waQr}</p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: '#388E3C', margin: 0 }}>{t.waComing}</p>
          )}
        </div>
      </div>
    </main>
  )
}
