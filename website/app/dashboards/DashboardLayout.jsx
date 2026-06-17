'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    { href: '/dashboard',         key: 'nav.queue'             },
    { href: '/dashboard#rx',      key: 'nav.writePrescription' },
    { href: '/dashboard#pay',     key: 'nav.myPay'             },
    { href: '/account',           key: 'nav.account'           },
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
    { href: '/dashboard#pay',      key: 'nav.myPay'         },
    { href: '/account',            key: 'nav.account'       },
  ]},
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

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '256px 1fr',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <aside style={{
        background: meta.color,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
              Klinova
            </span>
          </Link>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: 2 }}>
            {t(meta.portalKey)}
          </span>
        </div>

        {/* Avatar */}
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || 'User'}
            </p>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{t(meta.portalKey)}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {nav.map(item => (
            <Link
              key={item.href + item.label}
              href={item.href}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', marginBottom: 2 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer: sign out + language toggle */}
        <div style={{ padding: '8px 12px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <button
            onClick={signOut}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t('signOut')}
          </button>

          {/* Language toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            {['en', 'fr'].map(l => (
              <button
                key={l}
                onClick={() => { if (l !== lang) toggleLang() }}
                style={{
                  fontSize: 12,
                  fontWeight: l === lang ? 700 : 400,
                  color: l === lang ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: 'none',
                  border: 'none',
                  cursor: l === lang ? 'default' : 'pointer',
                  padding: '2px 4px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main style={{ overflowY: 'auto', padding: '2rem', background: '#F5EFE3' }}>
        {children}
      </main>
    </div>
  )
}
