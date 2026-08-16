'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'

const ROLE_META = {
  patient:    { portalKey: 'rolePortal.patient',    color: '#0E6B4F', nav: [
    { href: '/dashboard',          key: 'nav.home'         },
    { href: '/dashboard#consult',  key: 'nav.talkToDoctor' },
    { href: '/dashboard#rx',       key: 'nav.prescriptions'},
    { href: '/dashboard#pharmacy', key: 'nav.findPharmacy' },
    { href: '/dashboard#pay',      key: 'nav.myPay'        },
    { href: '/account',            key: 'nav.account'      },
  ]},
  doctor:     { portalKey: 'rolePortal.doctor',     color: '#0A5440', nav: [
    { href: '/dashboard',                    key: 'nav.queue'             },
    { href: '/dashboard#appointments',       key: 'nav.appointments'      },
    { href: '/dashboard#reports',            key: 'nav.reports'           },
    { href: '/dashboard#triage',             key: 'nav.triage'            },
    { href: '/dashboard#rx',                 key: 'nav.writePrescription' },
    { href: '/dashboard#pay',                key: 'nav.myPay'             },
    { href: '/account',                      key: 'nav.account'           },
  ]},
  pharmacist: { portalKey: 'rolePortal.pharmacist', color: '#D99A2B', nav: [
    { href: '/dashboard',         key: 'nav.prescriptions' },
    { href: '/dashboard#pay',     key: 'nav.myPay'         },
    { href: '/account',           key: 'nav.account'       },
  ]},
  admin:      { portalKey: 'rolePortal.admin',      color: '#15302A', nav: [
    { href: '/dashboard',          key: 'nav.overview'      },
    { href: '/dashboard#users',    key: 'nav.users'         },
    { href: '/dashboard#create',   key: 'nav.createAccount' },
    { href: '/dashboard#payroll',  key: 'nav.payroll'       },
    { href: '/gov',                key: 'nav.govPortal'     },
    { href: '/dashboard#pay',      key: 'nav.myPay'         },
    { href: '/account',            key: 'nav.account'       },
  ]},
  analyst:    { portalKey: 'rolePortal.analyst',    color: '#6E7F76', nav: [
    { href: '/dashboard',          key: 'nav.overview'       },
    { href: '/dashboard#consults', key: 'nav.consultations'  },
    { href: '/dashboard#rx',       key: 'nav.prescriptions'  },
    { href: '/dashboard#revenue',  key: 'nav.revenue'        },
    { href: '/dashboard#geo',      key: 'nav.geography'      },
    { href: '/dashboard#exports',  key: 'nav.exports'        },
    { href: '/dashboard#pay',      key: 'nav.myPay'          },
  ]},
  nurse:      { portalKey: 'rolePortal.nurse',      color: '#0E6B4F', nav: [
    { href: '/dashboard',          key: 'nav.overview'      },
    { href: '/dashboard#triage',   key: 'nav.triageQueue'   },
    { href: '/dashboard#vitals',   key: 'nav.recordVitals'  },
    { href: '/dashboard#pay',      key: 'nav.myPay'         },
    { href: '/account',            key: 'nav.account'       },
  ]},
  marketing:  { portalKey: 'rolePortal.marketing',  color: '#E0A23B', nav: [
    { href: '/dashboard',           key: 'nav.overview'   },
    { href: '/dashboard#campaigns', key: 'nav.campaigns'  },
    { href: '/dashboard#leads',     key: 'nav.leads'      },
    { href: '/dashboard#pay',       key: 'nav.myPay'      },
    { href: '/account',             key: 'nav.account'    },
  ]},
  frontdesk:  { portalKey: 'rolePortal.frontdesk',  color: '#CF5A3C', nav: [
    { href: '/dashboard',           key: 'nav.overview'      },
    { href: '/dashboard#patients',  key: 'nav.patientLookup' },
    { href: '/dashboard#book',      key: 'nav.bookConsult'   },
    { href: '/dashboard#pay',       key: 'nav.myPay'         },
    { href: '/account',             key: 'nav.account'       },
  ]},
  owner:      { portalKey: 'rolePortal.owner',      color: '#0A5440', nav: [
    { href: '/dashboard',          key: 'nav.overview'      },
    { href: '/dashboard#users',    key: 'nav.users'         },
    { href: '/dashboard#create',   key: 'nav.createAccount' },
    { href: '/dashboard#payroll',  key: 'nav.payroll'       },
    { href: '/gov',                key: 'nav.govPortal'     },
    { href: '/finance',            key: 'nav.finance'       },
    { href: '/dashboard#pay',      key: 'nav.myPay'         },
    { href: '/account',            key: 'nav.account'       },
  ]},
  government: { portalKey: 'rolePortal.government', color: '#1B4F72', nav: [
    { href: '/gov',    key: 'nav.govPortal' },
    { href: '/account', key: 'nav.account'  },
  ]},
}

function SidebarContents({ meta, nav, initials, userName, lang, toggleLang, signOut, t, onNavClick }) {
  return (
    <>
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/klinova-logo.png" alt="Klinova" width={36} height={36} style={{ borderRadius: 8, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Klinova</span>
        </Link>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: 4 }}>{t(meta.portalKey)}</span>
      </div>
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || 'User'}</p>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{t(meta.portalKey)}</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        {nav.map(item => (
          <Link key={item.href + item.label} href={item.href} onClick={onNavClick}
            className="kl-nav-link"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', marginBottom: 2 }}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '8px 12px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <button onClick={signOut}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t('signOut')}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
          {['en', 'fr'].map(l => (
            <button key={l} onClick={() => { if (l !== lang) toggleLang() }}
              style={{ fontSize: 12, fontWeight: l === lang ? 700 : 400, color: l === lang ? '#fff' : 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: l === lang ? 'default' : 'pointer', padding: '2px 4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default function DashboardLayout({ role, userName, children, financeAdmin = false }) {
  return (
    <LanguageProvider>
      <Inner role={role} userName={userName} financeAdmin={financeAdmin}>
        {children}
      </Inner>
    </LanguageProvider>
  )
}

function Inner({ role, userName, children, financeAdmin }) {
  const router = useRouter()
  const { t, lang, toggleLang } = useLanguage()

  const meta = ROLE_META[role] ?? ROLE_META.patient
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const nav = [
    ...meta.nav.map(item => ({ href: item.href, label: t(item.key) })),
    ...(financeAdmin ? [{ href: '/dashboard#financials', label: t('nav.companyFinancials') }] : []),
  ]

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @media (min-width: 768px) {
          .kl-shell { display: grid !important; grid-template-columns: 256px 1fr !important; }
          .kl-sidebar { display: flex !important; }
          .kl-topbar { display: none !important; }
          .kl-bottomnav { display: none !important; }
          .kl-main { padding-bottom: 2rem !important; }
        }
        @media (max-width: 767px) {
          .kl-sidebar { display: none !important; }
          .kl-shell { display: block !important; height: 100dvh; }
          .kl-drawer-open .kl-drawer { transform: translateX(0) !important; }
        }
        .kl-drawer { transition: transform .25s ease; }
        .kl-nav-link:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
      `}</style>

      {/* ── Shell (desktop: sidebar + main grid) ── */}
      <div className="kl-shell" style={{ flex: 1, overflow: 'hidden', height: '100%' }}>

        {/* Desktop sidebar */}
        <aside className="kl-sidebar" style={{ background: meta.color, flexDirection: 'column', overflowY: 'auto', height: '100%' }}>
          <SidebarContents meta={meta} nav={nav} initials={initials} userName={userName} lang={lang} toggleLang={toggleLang} signOut={signOut} t={t} />
        </aside>

        {/* Mobile top bar */}
        <div className="kl-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: meta.color, flexShrink: 0 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image src="/klinova-logo.png" alt="Klinova" width={28} height={28} style={{ borderRadius: 6 }} />
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 600, color: '#fff' }}>Klinova</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Language toggle */}
            <div style={{ display: 'flex', gap: 2 }}>
              {['en', 'fr'].map(l => (
                <button key={l} onClick={() => { if (l !== lang) toggleLang() }}
                  style={{ fontSize: 11, fontWeight: l === lang ? 700 : 400, color: l === lang ? '#fff' : 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {l}
                </button>
              ))}
            </div>
            {/* Hamburger */}
            <button onClick={() => setDrawerOpen(o => !o)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 18, height: 2, background: '#fff', borderRadius: 2 }} />)}
            </button>
          </div>
        </div>

        {/* Mobile drawer overlay */}
        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
        )}
        {/* Mobile drawer */}
        <div className="kl-drawer" style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
          background: meta.color, zIndex: 50, display: 'flex', flexDirection: 'column',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .25s ease', overflowY: 'auto',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 600, color: '#fff' }}>Klinova</span>
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>
          <SidebarContents meta={meta} nav={nav} initials={initials} userName={userName} lang={lang} toggleLang={toggleLang} signOut={signOut} t={t} onNavClick={() => setDrawerOpen(false)} />
        </div>

        {/* Main content */}
        <main className="kl-main" style={{ overflowY: 'auto', padding: '1.25rem 1rem 5rem', background: '#F5EFE3', height: '100%' }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="kl-bottomnav" style={{
        display: 'flex', background: '#fff', borderTop: '1px solid #E5DDD0',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {nav.slice(0, 5).map(item => (
          <Link key={item.href + item.label} href={item.href}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', fontSize: 10, color: '#666', textDecoration: 'none', gap: 3, textAlign: 'center', lineHeight: 1.2 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: meta.color, opacity: 0 }} />
            {item.label}
          </Link>
        ))}
        <button onClick={signOut}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', fontSize: 10, color: '#999', background: 'none', border: 'none', cursor: 'pointer', gap: 3 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t('signOut')}
        </button>
      </nav>
    </div>
  )
}
