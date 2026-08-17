'use client'
import { useState } from 'react'
import useSWR from 'swr'

const C = { ink: '#15302A', green: '#0E6B4F', deep: '#0A5440', coral: '#CF5A3C', soft: '#E3EFE8', ivory: '#F5EFE3', line: '#E7DECC', mute: '#6E7F76', sand: '#EDE4D2' }

const ROLE_LABELS = { doctor: 'Doctor', frontdesk: 'Clinic / Hospital', pharmacist: 'Pharmacy' }
const ROLE_COLORS = {
  doctor:     { bg: C.soft,          color: C.green },
  frontdesk:  { bg: '#FBEEE8',       color: C.coral },
  pharmacist: { bg: '#FEF3DC',       color: '#B87820' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function RolePill({ role }) {
  const s = ROLE_COLORS[role] ?? { bg: C.sand, color: C.ink }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function StatusPill({ status }) {
  const map = {
    pending:  { bg: '#FEF3DC', color: '#B87820', label: 'Pending' },
    rejected: { bg: '#FBEEE8', color: C.coral,   label: 'Rejected' },
  }
  const s = map[status] ?? { bg: C.sand, color: C.mute, label: status }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  )
}

export default function ApplicationsSection() {
  const { data, mutate, isLoading } = useSWR('/api/admin/applications', u => fetch(u).then(r => r.json()), { refreshInterval: 20000 })
  const [acting, setActing] = useState({})
  const [tab, setTab] = useState('pending')

  const pending  = data?.pending  ?? []
  const rejected = data?.rejected ?? []

  async function act(targetId, action) {
    setActing(a => ({ ...a, [targetId]: action }))
    await fetch('/api/admin/manage-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, targetId }),
    })
    await mutate()
    setActing(a => { const n = { ...a }; delete n[targetId]; return n })
  }

  const rows = tab === 'pending' ? pending : rejected
  const busy = isLoading

  return (
    <section style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.line}`, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 600, color: C.ink, margin: 0 }}>
            Applications
          </h3>
          <p style={{ fontSize: 13, color: C.mute, margin: '2px 0 0' }}>
            Review and approve provider applications
          </p>
        </div>
        {pending.length > 0 && (
          <span style={{ background: '#FEF3DC', color: '#B87820', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: C.ivory, borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {['pending', 'rejected'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .15s',
              background: tab === t ? '#fff' : 'transparent',
              color:      tab === t ? C.ink  : C.mute,
              boxShadow:  tab === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            }}>
            {t === 'pending' ? `Pending (${pending.length})` : `Rejected (${rejected.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {busy ? (
        <p style={{ fontSize: 13, color: C.mute, padding: '16px 0' }}>Loading…</p>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            {tab === 'pending' ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E6B4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : <span style={{ fontSize: 28 }}>—</span>}
          </div>
          <p style={{ fontSize: 14, color: C.mute, margin: 0 }}>
            {tab === 'pending' ? 'No pending applications' : 'No rejected applications'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                {['Name', 'Email', 'Role', 'Details', 'Applied', tab === 'pending' ? 'Actions' : 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(u => {
                const detail = u.role === 'doctor'     ? u.specialty
                             : u.role === 'frontdesk'  ? u.clinic_name
                             : u.role === 'pharmacist' ? u.pharmacy_name
                             : null
                const location = [u.city, u.country].filter(Boolean).join(', ')
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 600, color: C.ink }}>{u.full_name ?? '—'}</div>
                    </td>
                    <td style={{ padding: '12px 12px', color: C.mute }}>{u.email ?? '—'}</td>
                    <td style={{ padding: '12px 12px' }}><RolePill role={u.role} /></td>
                    <td style={{ padding: '12px 12px', color: C.mute }}>
                      {detail && <div style={{ fontWeight: 500, color: C.ink }}>{detail}</div>}
                      {location && <div style={{ fontSize: 12 }}>{location}</div>}
                    </td>
                    <td style={{ padding: '12px 12px', color: C.mute, whiteSpace: 'nowrap' }}>{fmtDate(u.created_at)}</td>
                    <td style={{ padding: '12px 12px' }}>
                      {tab === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            disabled={!!acting[u.id]}
                            onClick={() => act(u.id, 'approve_application')}
                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: acting[u.id] ? 'default' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                              background: acting[u.id] === 'approve_application' ? C.soft : C.green,
                              color: '#fff', opacity: acting[u.id] && acting[u.id] !== 'approve_application' ? 0.4 : 1, transition: 'all .15s' }}>
                            {acting[u.id] === 'approve_application' ? 'Approving…' : 'Approve'}
                          </button>
                          <button
                            disabled={!!acting[u.id]}
                            onClick={() => act(u.id, 'reject_application')}
                            style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${C.line}`, cursor: acting[u.id] ? 'default' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                              background: '#fff', color: C.coral, opacity: acting[u.id] && acting[u.id] !== 'reject_application' ? 0.4 : 1, transition: 'all .15s' }}>
                            {acting[u.id] === 'reject_application' ? 'Rejecting…' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <StatusPill status="rejected" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
