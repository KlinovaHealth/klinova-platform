'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const ROLE_META = {
  patient:    { label: 'Patient',     color: '#0E6B4F', light: '#E8F3EF', nav: [
    { href: '/dashboard',         label: 'Home'             },
    { href: '/dashboard#consult', label: 'Talk to a doctor' },
    { href: '/dashboard#rx',      label: 'Prescriptions'    },
    { href: '/dashboard#pharmacy',label: 'Find pharmacy'    },
    { href: '/dashboard#payments',label: 'Payments'         },
    { href: '/account',           label: 'Account'          },
  ]},
  doctor:     { label: 'Doctor',      color: '#2C6E8F', light: '#E8F0F5', nav: [
    { href: '/dashboard',         label: 'Queue'            },
    { href: '/dashboard#rx',      label: 'Write prescription'},
    { href: '/account',           label: 'Account'          },
  ]},
  pharmacist: { label: 'Pharmacist',  color: '#D99A2B', light: '#FBF4E5', nav: [
    { href: '/dashboard',         label: 'Prescriptions'    },
    { href: '/account',           label: 'Account'          },
  ]},
  admin:      { label: 'Admin',       color: '#6A4C93', light: '#F0EBF7', nav: [
    { href: '/dashboard',         label: 'Overview'         },
    { href: '/dashboard#users',   label: 'Users'            },
    { href: '/dashboard#create',  label: 'Create account'   },
    { href: '/account',           label: 'Account'          },
  ]},
  analyst:    { label: 'Analyst',     color: '#2C8C99', light: '#E6F4F5', nav: [
    { href: '/dashboard',         label: 'Overview'         },
    { href: '/dashboard#consults',label: 'Consultations'    },
    { href: '/dashboard#rx',      label: 'Prescriptions'    },
    { href: '/dashboard#revenue', label: 'Revenue'          },
    { href: '/dashboard#geo',     label: 'Geography'        },
    { href: '/dashboard#exports', label: 'Exports'          },
  ]},
}

export default function DashboardLayout({ role, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const meta = ROLE_META[role] ?? ROLE_META.patient
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="min-h-screen bg-ivory flex" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* ── Mobile overlay ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
                    transform transition-transform duration-200
                    lg:relative lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: meta.color }}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <Link href="/dashboard" className="block">
            <span style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em'
            }}>
              Klinova
            </span>
          </Link>
          <span className="text-xs mt-0.5 block" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {meta.label} Portal
          </span>
        </div>

        {/* Avatar + name */}
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || 'User'}
            </p>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {meta.nav.map(item => (
            <NavLink key={item.href + item.label} href={item.href} label={item.label} color={meta.color} />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6 pt-2 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm
                       text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3
                           bg-white border-b border-border shadow-sm sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg hover:bg-ivory">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15302A"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, color: meta.color }}>
            Klinova
          </span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: meta.color }}>
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, label, color }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm
                 text-white/75 hover:text-white hover:bg-white/10 transition-colors">
      {label}
    </Link>
  )
}
