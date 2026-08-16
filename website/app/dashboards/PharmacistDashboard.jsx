'use client'
import { useEffect, useState, useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, StatusBadge, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'

const C = {
  gold:    '#D99A2B',
  green:   '#0E6B4F',
  deep:    '#0A5440',
  ink:     '#15302A',
  coral:   '#CF5A3C',
  amber:   '#E0A23B',
  soft:    '#E3EFE8',
  ivory:   '#F5EFE3',
  sand:    '#EDE4D2',
  line:    '#E7DECC',
  mute:    '#6E7F76',
}

const RX_TABS    = ['all', 'pending', 'ready', 'fulfilled']
const DATE_VIEWS = ['today', 'this_week', 'next_week', 'last_2_weeks', 'last_month']
const DATE_LABELS = { today: 'Today', this_week: 'This week', next_week: 'Next week', last_2_weeks: 'Past 2 weeks', last_month: 'Past month' }

function dateRange(view) {
  const now = new Date()
  const sod = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
  const eod = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x }
  const monday = (d) => { const x = new Date(d); x.setDate(x.getDate() - (x.getDay() || 7) + 1); return sod(x) }

  switch (view) {
    case 'today':       return { start: sod(now), end: eod(now) }
    case 'this_week':   return { start: monday(now), end: eod(now) }
    case 'next_week': {
      const nm = monday(now); nm.setDate(nm.getDate() + 7)
      const ne = new Date(nm); ne.setDate(ne.getDate() + 6); ne.setHours(23,59,59,999)
      return { start: nm, end: ne }
    }
    case 'last_2_weeks': {
      const s = new Date(now); s.setDate(s.getDate() - 14); s.setHours(0,0,0,0)
      return { start: s, end: eod(now) }
    }
    case 'last_month': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { start: s, end: e }
    }
    default: return { start: sod(now), end: eod(now) }
  }
}

export default function PharmacistDashboard({ userId, name, pharmacyId }) {
  const supabase = createClient()
  const { t } = useLanguage()
  const [rxTab, setRxTab]       = useState('all')
  const [dateView, setDateView] = useState('today')
  const [mainTab, setMainTab]   = useState('overview')

  // Pharmacy info
  const { data: pharmacy } = useSWR(
    pharmacyId ? `pharmacy-info-${pharmacyId}` : null,
    async () => {
      const { data } = await supabase.from('pharmacies').select('id,name,address,phone,email').eq('id', pharmacyId).single()
      return data
    }
  )

  // All prescriptions for this pharmacy
  const { data: prescriptions = [], mutate: mutatePx } = useSWR(
    pharmacyId ? `rx-pharmacy-${pharmacyId}` : null,
    async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select('*, users!patient_id(full_name,email,created_at), users!doctor_id(full_name)')
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false })
        .limit(500)
      return data ?? []
    },
    { refreshInterval: 8000 }
  )

  // Stock
  const { data: stock = [], mutate: mutateStock } = useSWR(
    pharmacyId ? `stock-${pharmacyId}` : null,
    async () => {
      const { data } = await supabase
        .from('pharmacy_stock')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('medication_name')
      return data ?? []
    },
    { refreshInterval: 30000 }
  )

  // Realtime
  useEffect(() => {
    if (!pharmacyId) return
    const ch = supabase.channel(`pharmacy-rx-${pharmacyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions', filter: `pharmacy_id=eq.${pharmacyId}` }, () => mutatePx())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pharmacy_stock',  filter: `pharmacy_id=eq.${pharmacyId}` }, () => mutateStock())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [pharmacyId])

  async function updateRxStatus(id, status) {
    await supabase.from('prescriptions').update({ status }).eq('id', id).eq('pharmacy_id', pharmacyId)
    mutatePx()
  }

  // Stats
  const today0 = new Date(); today0.setHours(0,0,0,0)
  const pending        = prescriptions.filter(p => p.status === 'pending').length
  const ready          = prescriptions.filter(p => p.status === 'ready').length
  const fulfilledToday = prescriptions.filter(p => p.status === 'fulfilled' && new Date(p.created_at) >= today0).length
  const fulfilledAll   = prescriptions.filter(p => p.status === 'fulfilled').length

  // Patient timeline
  const timelinePatients = useMemo(() => {
    const { start, end } = dateRange(dateView)
    const inRange = prescriptions.filter(p => {
      const d = new Date(p.created_at)
      return d >= start && d <= end
    })
    // Unique patients
    const seen = new Set()
    return inRange.filter(p => {
      const key = p.patient_id
      if (seen.has(key)) return false
      seen.add(key); return true
    })
  }, [prescriptions, dateView])

  // Low stock alerts
  const lowStock = stock.filter(s => s.quantity <= (s.reorder_threshold ?? 10))
  const expiryAlerts = stock.filter(s => {
    if (!s.expiry_date) return false
    const days = (new Date(s.expiry_date) - Date.now()) / 86400000
    return days >= 0 && days <= 30
  })

  // 7-day chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (6 - i))
    const next = new Date(d); next.setDate(next.getDate() + 1)
    return {
      label: d.toLocaleDateString('fr-TG', { weekday: 'short' }),
      count: prescriptions.filter(p => p.status === 'fulfilled' && new Date(p.created_at) >= d && new Date(p.created_at) < next).length,
    }
  })
  const maxDay = Math.max(...last7.map(d => d.count), 1)
  const shown  = rxTab === 'all' ? prescriptions : prescriptions.filter(p => p.status === rxTab)

  if (!pharmacyId) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink/60">No pharmacy linked to your account.</p>
        <p className="text-xs text-ink/40 mt-1">Ask your Klinova administrator to link your pharmacy.</p>
      </div>
    )
  }

  const iCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                focus:outline-none focus:ring-2 focus:ring-[#D99A2B] focus:border-[#D99A2B]`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-2xl font-semibold text-ink">
            {getGreeting(name, t)}
          </h2>
          <p className="text-sm text-ink/60 mt-0.5">{pharmacy?.name ?? 'Pharmacy dashboard'}</p>
        </div>
        {pharmacy?.address && <p className="text-xs text-ink/40 text-right">{pharmacy.address}</p>}
      </div>

      {/* Main tab nav */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'overview',       label: 'Overview' },
          { key: 'patients',       label: 'Patients' },
          { key: 'inventory',      label: 'Inventory' },
          { key: 'prescriptions',  label: 'Prescriptions' },
          { key: 'reports',        label: 'Reports' },
          { key: 'listing',        label: '📍 Your Listing' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setMainTab(key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: mainTab === key ? C.gold : C.sand,
              color:      mainTab === key ? '#fff' : C.ink,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {mainTab === 'overview' && (<>
        {/* Alerts */}
        {(lowStock.length > 0 || expiryAlerts.length > 0) && (
          <div className="space-y-2">
            {lowStock.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: '#FFF7E6', borderColor: '#F4CE80' }}>
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-medium" style={{ color: C.amber }}>
                  {lowStock.length} medication{lowStock.length > 1 ? 's' : ''} running low: {lowStock.map(s => s.medication_name).join(', ')}
                </p>
              </div>
            )}
            {expiryAlerts.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: '#FFF0ED', borderColor: '#F5C0B0' }}>
                <span className="text-lg">🕒</span>
                <p className="text-sm font-medium" style={{ color: C.coral }}>
                  {expiryAlerts.length} item{expiryAlerts.length > 1 ? 's' : ''} expiring within 30 days
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Pending"         value={pending}        color={C.gold}  sub="awaiting prep" />
          <StatCard label="Ready"           value={ready}          color={C.green} sub="ready for pickup" />
          <StatCard label="Fulfilled today" value={fulfilledToday} color={C.deep}  sub="dispensed today" />
          <StatCard label="All time"        value={fulfilledAll}   color={C.mute}  sub="total fulfilled" />
        </div>

        {/* 7-day chart */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Fulfillments — last 7 days</h3>
          <div className="flex items-end gap-2 h-24">
            {last7.map(({ label, count }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-ink/50">{count || ''}</span>
                <div className="w-full rounded-t-sm transition-all duration-300"
                  style={{ height: `${Math.max((count / maxDay) * 72, count > 0 ? 4 : 2)}px`, background: count > 0 ? C.gold : C.line }} />
                <span className="text-xs text-ink/40">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stock summary */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink">Stock at a glance</h3>
            <button onClick={() => setMainTab('inventory')}
              className="text-xs font-semibold hover:underline" style={{ color: C.green }}>
              Manage inventory →
            </button>
          </div>
          {stock.length === 0 ? (
            <p className="text-sm text-ink/50">No stock entered yet. Go to Inventory to add your medications.</p>
          ) : (
            <div className="space-y-2">
              {stock.slice(0, 8).map(s => {
                const pct = Math.min((s.quantity / Math.max(s.reorder_threshold * 5, s.quantity, 1)) * 100, 100)
                const isLow = s.quantity <= (s.reorder_threshold ?? 10)
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs font-medium text-ink truncate">{s.medication_name}</span>
                        <span className="text-xs shrink-0 ml-2" style={{ color: isLow ? C.coral : C.mute }}>
                          {s.quantity} {s.unit}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: C.line }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: isLow ? C.coral : C.gold }} />
                      </div>
                    </div>
                    {isLow && <span className="text-xs font-bold shrink-0" style={{ color: C.coral }}>LOW</span>}
                  </div>
                )
              })}
              {stock.length > 8 && (
                <p className="text-xs text-ink/40 mt-1">+{stock.length - 8} more items</p>
              )}
            </div>
          )}
        </section>

        <MyPaySection userId={userId} />
      </>)}

      {/* ── PATIENTS ── */}
      {mainTab === 'patients' && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Patient schedule</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {DATE_VIEWS.map(v => (
              <button key={v} onClick={() => setDateView(v)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
                style={{
                  background: dateView === v ? C.gold : C.sand,
                  color:      dateView === v ? '#fff' : C.ink,
                }}>
                {DATE_LABELS[v]}
              </button>
            ))}
          </div>

          {timelinePatients.length === 0 ? (
            <p className="text-sm text-ink/50">No patients in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Patient</th>
                    <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Medications</th>
                    <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Status</th>
                    <th className="pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {timelinePatients.map(rx => (
                    <tr key={rx.id} className="border-b border-border/50 hover:bg-ivory">
                      <td className="py-2.5 pr-4 font-medium text-ink">
                        {rx.users?.full_name ?? rx.users?.email ?? 'Patient'}
                      </td>
                      <td className="py-2.5 pr-4 text-ink/60 text-xs max-w-[200px] truncate">
                        {formatMeds(rx.medications)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={rx.status} />
                      </td>
                      <td className="py-2.5 text-ink/40 whitespace-nowrap text-xs">
                        {fmtDateTime(rx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-ink/40 mt-3">{timelinePatients.length} unique patient{timelinePatients.length !== 1 ? 's' : ''} — {DATE_LABELS[dateView].toLowerCase()}</p>
            </div>
          )}
        </section>
      )}

      {/* ── INVENTORY ── */}
      {mainTab === 'inventory' && (
        <InventorySection pharmacyId={pharmacyId} supabase={supabase} stock={stock} mutate={mutateStock} />
      )}

      {/* ── PRESCRIPTIONS ── */}
      {mainTab === 'prescriptions' && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-semibold text-ink">All prescriptions</h3>
            <div className="flex gap-1">
              {RX_TABS.map(tab => {
                const counts = { all: prescriptions.length, pending, ready, fulfilled: fulfilledAll }
                return (
                  <button key={tab} onClick={() => setRxTab(tab)}
                    className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors"
                    style={{
                      background: rxTab === tab ? C.gold : C.sand,
                      color:      rxTab === tab ? '#fff' : C.mute,
                    }}>
                    {tab} {counts[tab] > 0 ? `(${counts[tab]})` : ''}
                  </button>
                )
              })}
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="text-sm text-ink/50">No prescriptions in this view.</p>
          ) : (
            <div className="space-y-3">
              {shown.map(rx => (
                <RxCard key={rx.id} rx={rx} onUpdate={updateRxStatus} color={C.gold} t={t} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── REPORTS ── */}
      {mainTab === 'reports' && (
        <PharmacyReportsTab supabase={supabase} pharmacyId={pharmacyId} stock={stock} prescriptions={prescriptions} />
      )}

      {/* ── LISTING ── */}
      {mainTab === 'listing' && (
        <PharmacyListingSection supabase={supabase} userId={userId} pharmacyId={pharmacyId} pharmacy={pharmacy} />
      )}
    </div>
  )
}

function PharmacyReportsTab({ supabase, pharmacyId, stock, prescriptions }) {
  const [period, setPeriod] = useState('30d')
  const PERIODS = [{ key: '7d', label: '7 days' }, { key: '30d', label: '30 days' }, { key: '90d', label: '3 months' }]

  function periodStart(key) {
    const d = new Date()
    if (key === '7d')  d.setDate(d.getDate() - 7)
    if (key === '30d') d.setDate(d.getDate() - 30)
    if (key === '90d') d.setDate(d.getDate() - 90)
    return d
  }

  const start = periodStart(period)
  const inPeriod = prescriptions.filter(p => new Date(p.created_at) >= start)
  const fulfilled = inPeriod.filter(p => p.status === 'fulfilled')
  const pending   = inPeriod.filter(p => p.status === 'pending')
  const ready     = inPeriod.filter(p => p.status === 'ready')

  // Top medications dispensed
  const medCounts = {}
  fulfilled.forEach(rx => {
    const meds = Array.isArray(rx.medications) ? rx.medications : []
    meds.forEach(m => {
      const name = m.name ?? m
      medCounts[name] = (medCounts[name] ?? 0) + 1
    })
  })
  const topMeds = Object.entries(medCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Daily fulfillments for chart
  const days = period === '7d' ? 7 : period === '30d' ? 14 : 12
  const dayData = Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setHours(0,0,0,0)
    if (period === '90d') {
      d.setDate(d.getDate() - (days - 1 - i) * 7)
      const next = new Date(d); next.setDate(next.getDate() + 7)
      return {
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        count: fulfilled.filter(p => new Date(p.created_at) >= d && new Date(p.created_at) < next).length,
      }
    }
    d.setDate(d.getDate() - (days - 1 - i))
    const next = new Date(d); next.setDate(next.getDate() + 1)
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      count: fulfilled.filter(p => new Date(p.created_at) >= d && new Date(p.created_at) < next).length,
    }
  })
  const maxDay = Math.max(...dayData.map(d => d.count), 1)

  // Inventory value (if cost/selling prices available)
  const invValue = stock.reduce((sum, s) => sum + (s.quantity * (s.selling_price ?? 0)), 0)
  const invCost  = stock.reduce((sum, s) => sum + (s.quantity * (s.cost_price ?? 0)), 0)

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: period === p.key ? C.gold : C.sand, color: period === p.key ? '#fff' : C.ink }}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Prescriptions in</p>
          <p className="text-3xl font-bold" style={{ color: C.gold }}>{inPeriod.length}</p>
          <p className="text-xs text-ink/40 mt-1">received</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Fulfilled</p>
          <p className="text-3xl font-bold" style={{ color: C.green }}>{fulfilled.length}</p>
          <p className="text-xs text-ink/40 mt-1">{inPeriod.length ? Math.round((fulfilled.length / inPeriod.length) * 100) : 0}% fill rate</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-3xl font-bold" style={{ color: C.amber }}>{pending.length}</p>
          <p className="text-xs text-ink/40 mt-1">awaiting prep</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Stock items</p>
          <p className="text-3xl font-bold" style={{ color: C.deep }}>{stock.length}</p>
          <p className="text-xs text-ink/40 mt-1">{stock.filter(s => s.quantity <= (s.reorder_threshold ?? 10)).length} low</p>
        </div>
      </div>

      {/* Fulfillment chart */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Fulfillments over time</h3>
        <div className="flex items-end gap-1 h-24">
          {dayData.map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-ink/40" style={{ fontSize: 9 }}>{count || ''}</span>
              <div className="w-full rounded-t-sm"
                style={{ height: `${Math.max((count / maxDay) * 68, count > 0 ? 3 : 1)}px`, background: count > 0 ? C.gold : C.line }} />
              <span className="text-ink/30" style={{ fontSize: 8 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top medications */}
      {topMeds.length > 0 && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Most dispensed medications</h3>
          <div className="space-y-2">
            {topMeds.map(([med, count]) => {
              const pct = Math.round((count / topMeds[0][1]) * 100)
              return (
                <div key={med} className="flex items-center gap-3">
                  <span className="text-sm text-ink flex-1 min-w-0 truncate">{med}</span>
                  <div className="w-24 h-2 rounded-full flex-shrink-0" style={{ background: C.line }}>
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: C.gold }} />
                  </div>
                  <span className="text-xs font-bold text-ink/60 w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Inventory value */}
      {invValue > 0 && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Inventory value</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[140px] bg-ivory rounded-lg p-4 border border-border">
              <p className="text-xs font-semibold text-ink/50 uppercase mb-1">Retail value</p>
              <p className="text-xl font-bold text-ink">{invValue.toLocaleString('fr-FR')} XOF</p>
            </div>
            {invCost > 0 && (
              <div className="flex-1 min-w-[140px] bg-ivory rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-ink/50 uppercase mb-1">Cost value</p>
                <p className="text-xl font-bold text-ink">{invCost.toLocaleString('fr-FR')} XOF</p>
              </div>
            )}
            {invCost > 0 && (
              <div className="flex-1 min-w-[140px] bg-ivory rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-ink/50 uppercase mb-1">Gross margin</p>
                <p className="text-xl font-bold" style={{ color: C.green }}>
                  {Math.round(((invValue - invCost) / invValue) * 100)}%
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

const PHARMACY_SERVICES = [
  'Prescription dispensing', 'Over-the-counter medications', 'Medication delivery',
  'Blood pressure monitoring', 'Diabetes supplies', 'Wound care',
  'Vaccination', 'Family planning', 'Medical equipment',
]
const LISTING_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const LISTING_HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`)

function PharmacyListingSection({ supabase, userId, pharmacyId, pharmacy }) {
  const [form, setForm] = useState({
    name: pharmacy?.name ?? '',
    address: pharmacy?.address ?? '',
    phone: pharmacy?.phone ?? '',
    email: pharmacy?.email ?? '',
    services: [],
    hours: Object.fromEntries(LISTING_DAYS.map(d => [d, { open: true, from: '08:00', to: '20:00' }])),
    lat: '', lng: '', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function toggleService(s) {
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
    }))
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setMsg('')
    const { error } = await supabase.from('pharmacies').update({
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      services: form.services,
      hours: form.hours,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      notes: form.notes.trim() || null,
      listed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', pharmacyId)
    setMsg(error ? `Error: ${error.message}` : 'Listing saved. Patients will be able to find you on the Klinova map.')
    setSaving(false)
  }

  const inp = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
               focus:outline-none focus:ring-2 focus:ring-[#D99A2B] focus:border-[#D99A2B]`

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-6 border" style={{ background: '#E3EFE8', borderColor: '#0E6B4F30' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: C.gold }}>📍</div>
          <div>
            <h3 className="font-semibold text-ink text-lg mb-1">Get listed on the map</h3>
            <p className="text-sm text-ink/70 leading-relaxed">
              Patients searching for nearby pharmacies on Klinova will find you and can send their prescriptions directly to your pharmacy.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h4 className="font-semibold text-ink mb-4">Pharmacy information</h4>
          {msg && (
            <p className="text-sm mb-4 px-3 py-2 rounded-lg"
              style={{ background: msg.startsWith('Error') ? '#FFF0ED' : '#E3EFE8', color: msg.startsWith('Error') ? C.coral : C.green }}>
              {msg}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink mb-1">Pharmacy name <span style={{ color: C.coral }}>*</span></label>
              <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="Pharmacie Centrale, Lomé" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink mb-1">Full address <span style={{ color: C.coral }}>*</span></label>
              <input required type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inp} placeholder="Boulevard du 13 Janvier, Lomé, Togo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp} placeholder="+228 90 00 00 00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} placeholder="pharmacie@exemple.tg" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h4 className="font-semibold text-ink mb-3">Services</h4>
          <div className="flex flex-wrap gap-2">
            {PHARMACY_SERVICES.map(s => (
              <button key={s} type="button" onClick={() => toggleService(s)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                style={{
                  background: form.services.includes(s) ? C.gold : C.ivory,
                  color:      form.services.includes(s) ? '#fff' : C.ink,
                  borderColor: form.services.includes(s) ? C.gold : C.line,
                }}>
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h4 className="font-semibold text-ink mb-4">Opening hours</h4>
          <div className="space-y-3">
            {LISTING_DAYS.map(day => (
              <div key={day} className="flex items-center gap-3 flex-wrap">
                <div className="w-24">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.hours[day].open}
                      onChange={e => setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], open: e.target.checked } } }))}
                      className="w-4 h-4 rounded" />
                    <span className="text-sm text-ink">{day.slice(0,3)}</span>
                  </label>
                </div>
                {form.hours[day].open ? (<>
                  <select value={form.hours[day].from}
                    onChange={e => setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], from: e.target.value } } }))}
                    className="px-2 py-1.5 rounded-lg border border-border bg-ivory text-ink text-sm focus:outline-none">
                    {LISTING_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-xs text-ink/40">to</span>
                  <select value={form.hours[day].to}
                    onChange={e => setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], to: e.target.value } } }))}
                    className="px-2 py-1.5 rounded-lg border border-border bg-ivory text-ink text-sm focus:outline-none">
                    {LISTING_HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </>) : <span className="text-sm text-ink/40">Closed</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h4 className="font-semibold text-ink mb-1">Map coordinates <span className="text-xs font-normal text-ink/40">(optional)</span></h4>
          <p className="text-xs text-ink/50 mb-4">Right-click your location on Google Maps to copy coordinates.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Latitude</label>
              <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} className={inp} placeholder="6.1375" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Longitude</label>
              <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} className={inp} placeholder="1.2123" />
            </div>
          </div>
        </section>

        <button type="submit" disabled={saving}
          className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50"
          style={{ background: C.gold }}>
          {saving ? 'Saving…' : 'Submit listing'}
        </button>
      </form>
    </div>
  )
}

function InventorySection({ pharmacyId, supabase, stock, mutate }) {
  const emptyForm = { medication_name: '', quantity: '', unit: 'units', reorder_threshold: '10', expiry_date: '', cost_price: '', selling_price: '' }
  const [form, setForm]     = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const iCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                focus:outline-none focus:ring-2 focus:ring-[#D99A2B] focus:border-[#D99A2B]`

  const filtered = stock.filter(s =>
    s.medication_name.toLowerCase().includes(search.toLowerCase())
  )

  function startEdit(s) {
    setEditing(s.id)
    setForm({
      medication_name: s.medication_name,
      quantity:        String(s.quantity),
      unit:            s.unit ?? 'units',
      reorder_threshold: String(s.reorder_threshold ?? 10),
      expiry_date:     s.expiry_date ?? '',
      cost_price:      String(s.cost_price ?? ''),
      selling_price:   String(s.selling_price ?? ''),
    })
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = {
      pharmacy_id:       pharmacyId,
      medication_name:   form.medication_name.trim(),
      quantity:          parseInt(form.quantity) || 0,
      unit:              form.unit,
      reorder_threshold: parseInt(form.reorder_threshold) || 10,
      expiry_date:       form.expiry_date || null,
      cost_price:        form.cost_price   ? parseFloat(form.cost_price)   : null,
      selling_price:     form.selling_price ? parseFloat(form.selling_price) : null,
      updated_at:        new Date().toISOString(),
    }
    const { error } = editing
      ? await supabase.from('pharmacy_stock').update(payload).eq('id', editing)
      : await supabase.from('pharmacy_stock').upsert(payload, { onConflict: 'pharmacy_id,medication_name' })
    if (error) { setMsg('Error: ' + error.message) } else {
      setMsg(editing ? 'Updated.' : 'Added.'); setForm(emptyForm); setEditing(null); mutate()
    }
    setSaving(false)
  }

  async function handleRemove(id) {
    if (!confirm('Remove this medication from your stock list?')) return
    await supabase.from('pharmacy_stock').delete().eq('id', id)
    mutate()
  }

  async function quickUpdate(id, delta) {
    const item = stock.find(s => s.id === id)
    if (!item) return
    const newQty = Math.max(0, item.quantity + delta)
    await supabase.from('pharmacy_stock').update({ quantity: newQty, updated_at: new Date().toISOString() }).eq('id', id)
    mutate()
  }

  return (
    <div className="space-y-5">
      {/* Stock table */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-ink">Inventory</h3>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search medications…"
            className="px-3 py-2 rounded-lg border border-border bg-ivory text-ink text-sm focus:outline-none focus:ring-2"
            style={{ maxWidth: 220 }} />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-ink/50">No medications yet. Add your first item below.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {['Medication', 'Stock', 'Reorder at', 'Expiry', 'Cost / Sell', 'Actions'].map(h => (
                    <th key={h} className="pb-2 pr-4 text-xs font-semibold text-ink/50 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const isLow = s.quantity <= (s.reorder_threshold ?? 10)
                  const daysToExpiry = s.expiry_date ? Math.ceil((new Date(s.expiry_date) - Date.now()) / 86400000) : null
                  const expiringSoon = daysToExpiry !== null && daysToExpiry <= 30 && daysToExpiry >= 0
                  return (
                    <tr key={s.id} className={`border-b border-border/50 hover:bg-ivory ${isLow ? 'bg-[#FFF9F0]' : ''}`}>
                      <td className="py-2.5 pr-4 font-medium text-ink">{s.medication_name}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => quickUpdate(s.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold hover:bg-[#EDE4D2]"
                            style={{ color: C.mute }}>−</button>
                          <span className="text-sm font-bold min-w-[2rem] text-center"
                            style={{ color: isLow ? C.coral : C.ink }}>
                            {s.quantity}
                          </span>
                          <button onClick={() => quickUpdate(s.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold hover:bg-[#EDE4D2]"
                            style={{ color: C.green }}>+</button>
                          <span className="text-xs text-ink/40">{s.unit}</span>
                          {isLow && <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ background: '#FFF0ED', color: C.coral }}>LOW</span>}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-ink/60 text-sm">{s.reorder_threshold ?? 10}</td>
                      <td className="py-2.5 pr-4 text-sm" style={{ color: expiringSoon ? C.coral : C.mute }}>
                        {s.expiry_date ? `${s.expiry_date}${expiringSoon ? ` (${daysToExpiry}d)` : ''}` : '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-ink/50">
                        {s.cost_price ? `${s.cost_price} / ${s.selling_price ?? '—'} XOF` : '—'}
                      </td>
                      <td className="py-2.5">
                        <div className="flex gap-3">
                          <button onClick={() => startEdit(s)}
                            className="text-xs font-semibold hover:underline" style={{ color: C.green }}>Edit</button>
                          <button onClick={() => handleRemove(s.id)}
                            className="text-xs hover:underline" style={{ color: C.coral }}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add / edit form */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">{editing ? 'Edit medication' : 'Add medication'}</h3>
        {editing && (
          <button onClick={() => { setEditing(null); setForm(emptyForm) }}
            className="text-xs mb-3 hover:underline block" style={{ color: C.mute }}>
            ← Cancel edit
          </button>
        )}
        {msg && <p className="text-xs mb-3" style={{ color: msg.startsWith('Error') ? C.coral : C.green }}>{msg}</p>}

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-ink mb-1">Medication name <span style={{ color: C.coral }}>*</span></label>
            <input required type="text" value={form.medication_name}
              onChange={e => setForm(f => ({ ...f, medication_name: e.target.value }))}
              className={iCls} placeholder="e.g. Amoxicillin 500mg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Quantity in stock <span style={{ color: C.coral }}>*</span></label>
            <input required type="number" min="0" value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              className={iCls} placeholder="120" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Unit</label>
            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className={iCls}>
              {['units','boxes','vials','ampoules','sachets','tablets','capsules','bottles'].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Reorder alert below</label>
            <input type="number" min="0" value={form.reorder_threshold}
              onChange={e => setForm(f => ({ ...f, reorder_threshold: e.target.value }))}
              className={iCls} placeholder="10" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Expiry date</label>
            <input type="date" value={form.expiry_date}
              onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
              className={iCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Cost price (XOF)</label>
            <input type="number" min="0" step="1" value={form.cost_price}
              onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))}
              className={iCls} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Selling price (XOF)</label>
            <input type="number" min="0" step="1" value={form.selling_price}
              onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))}
              className={iCls} placeholder="Optional" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              style={{ background: C.gold }}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add to inventory'}
            </button>
          </div>
        </form>
      </section>

      {/* Upcoming stock needs */}
      {(lowStock.length > 0 || filtered.filter(s => s.expiry_date).length > 0) && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Upcoming stock needs</h3>
          <div className="space-y-2">
            {lowStock.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-lg border"
                style={{ background: '#FFF9F0', borderColor: '#F4CE80' }}>
                <div>
                  <p className="text-sm font-semibold text-ink">{s.medication_name}</p>
                  <p className="text-xs" style={{ color: C.amber }}>Only {s.quantity} {s.unit} left — reorder threshold: {s.reorder_threshold ?? 10}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: C.amber, color: '#fff' }}>REORDER</span>
              </div>
            ))}
            {filtered.filter(s => {
              if (!s.expiry_date) return false
              const days = (new Date(s.expiry_date) - Date.now()) / 86400000
              return days >= 0 && days <= 30
            }).map(s => {
              const days = Math.ceil((new Date(s.expiry_date) - Date.now()) / 86400000)
              return (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-lg border"
                  style={{ background: '#FFF0ED', borderColor: '#F5C0B0' }}>
                  <div>
                    <p className="text-sm font-semibold text-ink">{s.medication_name}</p>
                    <p className="text-xs" style={{ color: C.coral }}>Expires {s.expiry_date} — in {days} day{days !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: C.coral, color: '#fff' }}>EXPIRING</span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function RxCard({ rx, onUpdate, color, t }) {
  const patientName = rx.users?.full_name ?? rx.users?.email ?? 'Patient'
  const doctorName  = rx.users_1?.full_name ?? '—'
  const meds        = formatMeds(rx.medications)

  return (
    <div className="p-4 rounded-lg border border-border bg-ivory">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={rx.status} />
            <span className="text-xs text-ink/40">{fmtDateTime(rx.created_at)}</span>
          </div>
          <p className="text-sm font-medium text-ink">{patientName}</p>
          <p className="text-xs text-ink/50 mt-0.5">Prescribed by Dr. {doctorName}</p>
          <p className="text-xs text-ink/70 mt-2 leading-relaxed">{meds}</p>
          {rx.notes && <p className="text-xs text-ink/50 mt-1 italic">{rx.notes}</p>}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {rx.status === 'pending' && (
            <button onClick={() => onUpdate(rx.id, 'ready')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90"
              style={{ background: color }}>
              Mark ready
            </button>
          )}
          {rx.status === 'ready' && (
            <button onClick={() => onUpdate(rx.id, 'fulfilled')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90"
              style={{ background: C.green }}>
              Mark fulfilled
            </button>
          )}
          {rx.status === 'fulfilled' && (
            <span className="text-xs font-medium" style={{ color: C.green }}>Done ✓</span>
          )}
        </div>
      </div>
    </div>
  )
}

function formatMeds(meds) {
  if (!meds) return '—'
  if (Array.isArray(meds)) return meds.map(m => m.name ?? m).join(' · ')
  if (typeof meds === 'string') return meds
  return JSON.stringify(meds)
}

function fmtDateTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
