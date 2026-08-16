'use client'
import useSWR from 'swr'

const C = {
  ink:      '#15302A',
  green:    '#0E6B4F',
  deep:     '#0A5440',
  soft:     '#E3EFE8',
  ivory:    '#F5EFE3',
  sand:     '#EDE4D2',
  gold:     '#D99A2B',
  coral:    '#CF5A3C',
  mute:     '#6E7F76',
  line:     '#E7DECC',
}

const ROLE_META = {
  doctor:     { label: 'Doctors',          color: C.deep,  icon: '🩺' },
  frontdesk:  { label: 'Clinics / Hospitals', color: C.green, icon: '🏥' },
  pharmacist: { label: 'Pharmacies',       color: C.gold,  icon: '💊' },
  government: { label: 'Governments / NGOs', color: C.ink, icon: '🏛️' },
}

const fetcher = () => fetch('/api/admin/partners').then(r => r.json())

export default function PartnersDashboard() {
  const { data, isLoading } = useSWR('partners-overview', fetcher, { refreshInterval: 60000 })

  if (isLoading) return <p className="text-sm text-ink/50 p-8">Loading partner data…</p>
  if (!data || data.error) return <p className="text-sm text-[#CF5A3C] p-8">{data?.error ?? 'Failed to load.'}</p>

  const { counts = {}, recent = [], pharmacies = [], growth = [] } = data
  const maxGrowth = Math.max(...growth.flatMap(m => [m.doctor, m.frontdesk, m.pharmacist, m.government]), 1)

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">Partner overview</h2>
        <p className="text-sm text-ink/60 mt-0.5">Total partners on the platform and growth trends.</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(ROLE_META).map(([role, meta]) => (
          <div key={role} className="bg-white rounded-xl border border-border shadow-card p-5">
            <div className="text-2xl mb-2">{meta.icon}</div>
            <p className="text-3xl font-bold" style={{ color: meta.color }}>
              {role === 'pharmacist' ? counts.pharmacy_entity ?? 0 : counts[role] ?? 0}
            </p>
            <p className="text-xs text-ink/50 mt-1 font-medium">{meta.label}</p>
          </div>
        ))}
      </div>

      {/* Growth chart — last 6 months */}
      {growth.length > 0 && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-5">New partners — last 6 months</h3>
          <div className="flex items-end gap-3 overflow-x-auto pb-2">
            {growth.map(m => {
              const total = m.doctor + m.frontdesk + m.pharmacist + m.government
              return (
                <div key={m.label} className="flex-1 min-w-[60px] flex flex-col items-center gap-1">
                  <span className="text-xs text-ink/50">{total || ''}</span>
                  <div className="w-full flex flex-col-reverse gap-px rounded-t-sm overflow-hidden"
                    style={{ height: 80 }}>
                    {[
                      { key: 'doctor',     color: C.deep  },
                      { key: 'frontdesk',  color: C.green },
                      { key: 'pharmacist', color: C.gold  },
                      { key: 'government', color: C.ink   },
                    ].map(({ key, color }) => m[key] > 0 && (
                      <div key={key}
                        style={{ height: `${(m[key] / maxGrowth) * 72}px`, background: color, minHeight: 3 }} />
                    ))}
                    {total === 0 && <div style={{ height: 3, background: C.line }} />}
                  </div>
                  <span className="text-xs text-ink/40">{m.label}</span>
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {Object.entries(ROLE_META).map(([role, meta]) => (
              <div key={role} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: meta.color }} />
                <span className="text-xs text-ink/60">{meta.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pharmacies with address */}
      {pharmacies.length > 0 && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Registered pharmacies</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Name</th>
                  <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Address / Region</th>
                  <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Contact</th>
                  <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody>
                {pharmacies.map(ph => (
                  <tr key={ph.id} className="border-b border-border/50 hover:bg-ivory">
                    <td className="py-2.5 pr-4 font-medium text-ink">{ph.name}</td>
                    <td className="py-2.5 pr-4 text-ink/60">{ph.address ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-ink/60">{ph.phone ?? ph.email ?? '—'}</td>
                    <td className="py-2.5 text-ink/40 whitespace-nowrap">{fmtDate(ph.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent partner registrations */}
      {recent.length > 0 && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Recent partner registrations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Name</th>
                  <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Role</th>
                  <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Email</th>
                  <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(u => {
                  const meta = ROLE_META[u.role]
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-ivory">
                      <td className="py-2.5 pr-4 font-medium text-ink">{u.full_name ?? '—'}</td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${meta?.color ?? C.mute}18`, color: meta?.color ?? C.mute }}>
                          {meta?.icon} {meta?.label ?? u.role}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-ink/60">{u.email}</td>
                      <td className="py-2.5 text-ink/40 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Grow section */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">Grow the network</h3>
        <p className="text-sm text-ink/55 mb-4">Share these links to onboard new partners directly — no manual setup needed.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { role: 'doctors',    label: 'Invite a Doctor',      icon: '🩺', color: C.deep  },
            { role: 'clinics',    label: 'Invite a Clinic',       icon: '🏥', color: C.green },
            { role: 'pharmacy',   label: 'Invite a Pharmacy',     icon: '💊', color: C.gold  },
            { role: 'government', label: 'Invite Government/NGO', icon: '🏛️', color: C.ink   },
          ].map(({ role, label, icon, color }) => (
            <div key={role} className="flex items-center justify-between p-4 rounded-xl border border-border bg-ivory gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs text-ink/50">klinova.co/get-started/{role}</p>
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`https://klinova.co/get-started/${role}`)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                style={{ background: color }}>
                Copy link
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
