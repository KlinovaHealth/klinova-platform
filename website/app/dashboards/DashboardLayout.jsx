'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const ROLE_META = {
  patient:    { label: 'Patient',     color: '#0E6B4F', nav: [
    { href: '/dashboard',         label: 'Home'             },
    { href: '/dashboard#consult', label: 'Talk to a doctor' },
    { href: '/dashboard#rx',      label: 'Prescriptions'    },
    { href: '/dashboard#pharmacy',label: 'Find pharmacy'    },
    { href: '/dashboard#payments',label: 'Payments'         },
    { href: '/account',           label: 'Account'          },
  ]},
  doctor:     { label: 'Doctor',      color: '#2C6E8F', nav: [
    { href: '/dashboard',         label: 'Queue'            },
    { href: '/dashboard#rx',      label: 'Write prescription'},
    { href: '/account',           label: 'Account'          },
  ]},
  pharmacist: { label: 'Pharmacist',  color: '#D99A2B', nav: [
    { href: '/dashboard',         label: 'Prescriptions'    },
    { href: '/account',           label: 'Account'          },
  ]},
  admin:      { label: 'Admin',       color: '#6A4C93', nav: [
    { href: '/dashboard',         label: 'Overview'         },
    { href: '/dashboard#users',   label: 'Users'            },
    { href: '/dashboard#create',  label: 'Create account'   },
    { href: '/account',           label: 'Account'          },
  ]},
  analyst:    { label: 'Analyst',     color: '#2C8C99', nav: [
    { href: '/dashboard',         label: 'Overview'         },
    { href: '/dashboard#consults',label: 'Consultations'    },
    { href: '/dashboard#rx',      label: 'Prescriptions'    },
    { href: '/dashboard#revenue', label: 'Revenue'          },
    { href: '/dashboard#geo',     label: 'Geography'        },
    { href: '/dashboard#exports', label: 'Exports'          },
  ]},
}

export default function DashboardLayout({ role, userName, children }) {
  const router = useRouter()
  const meta = ROLE_META[role] ?? ROLE_META.patient
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

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
      {/* ── Sidebar ── */}
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
            {meta.label} Portal
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
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{meta.label}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {meta.nav.map(item => (
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

        {/* Sign out */}
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
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ overflowY: 'auto', padding: '2rem', background: '#F5EFE3' }}>
        {children}
      </main>
    </div>
  )
}
