'use client'
import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard } from './PatientDashboard'
import MyPaySection from './MyPaySection'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const C = '#2C8C99'

// All analyst data comes exclusively from analytics_* views — never from raw tables.
// The views are created by an admin/DB migration and contain only aggregated,
// de-identified data. No patient names, phone numbers, or exact addresses.

const COLORS = ['#0E6B4F', '#2C6E8F', '#D99A2B', '#6A4C93', '#2C8C99', '#E7DECC']

function useDateRange() {
  const today = new Date()
  const thirtyAgo = new Date(today); thirtyAgo.setDate(today.getDate() - 30)
  const [from, setFrom] = useState(thirtyAgo.toISOString().slice(0, 10))
  const [to,   setTo]   = useState(today.toISOString().slice(0, 10))
  return { from, to, setFrom, setTo }
}

export default function AnalystDashboard({ userId, name }) {
  const supabase = createClient()
  const { from, to, setFrom, setTo } = useDateRange()
  const [district, setDistrict] = useState('')
  const [channel,  setChannel]  = useState('')

  // Helper to build query with filters
  const filtered = useCallback(
    (query) => {
      let q = query.gte('date', from).lte('date', to)
      if (district) q = q.eq('district', district)
      if (channel)  q = q.eq('channel', channel)
      return q
    },
    [from, to, district, channel]
  )

  // ── analytics_consult_volume ──────────────────────────────
  const { data: volume = [] } = useSWR(
    ['analytics_consult_volume', from, to, district, channel],
    async () => {
      let q = supabase.from('analytics_consult_volume').select('date, count, channel')
        .gte('date', from).lte('date', to)
      if (channel) q = q.eq('channel', channel)
      const { data } = await q.order('date', { ascending: true })
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  // ── analytics_consult_by_district ─────────────────────────
  const { data: byDistrict = [] } = useSWR(
    ['analytics_consult_by_district', from, to],
    async () => {
      const { data } = await supabase
        .from('analytics_consult_by_district')
        .select('district, count')
        .gte('date', from).lte('date', to)
        .order('count', { ascending: false })
        .limit(10)
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  // ── analytics_top_reasons ─────────────────────────────────
  const { data: topReasons = [] } = useSWR(
    ['analytics_top_reasons', from, to],
    async () => {
      const { data } = await supabase
        .from('analytics_top_reasons')
        .select('reason, count')
        .gte('date', from).lte('date', to)
        .order('count', { ascending: false })
        .limit(8)
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  // ── analytics_prescription_fulfillment ────────────────────
  const { data: fulfillment = [] } = useSWR(
    ['analytics_prescription_fulfillment', from, to],
    async () => {
      const { data } = await supabase
        .from('analytics_prescription_fulfillment')
        .select('status, count')
        .gte('date', from).lte('date', to)
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  // ── analytics_revenue ─────────────────────────────────────
  const { data: revenue = [] } = useSWR(
    ['analytics_revenue', from, to, channel],
    async () => {
      let q = supabase.from('analytics_revenue').select('date, amount, channel')
        .gte('date', from).lte('date', to)
      if (channel) q = q.eq('channel', channel)
      const { data } = await q.order('date', { ascending: true })
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  // ── Distinct districts for filter ────────────────────────
  const { data: districts = [] } = useSWR('analytics_districts', async () => {
    const { data } = await supabase
      .from('analytics_consult_by_district')
      .select('district')
    return [...new Set((data ?? []).map(d => d.district).filter(Boolean))]
  })

  // ── Summary totals ────────────────────────────────────────
  const totalConsults  = volume.reduce((s, r) => s + (r.count ?? 0), 0)
  const totalRevenue   = revenue.reduce((s, r) => s + (r.amount ?? 0), 0)
  const fulfillRate    = (() => {
    const ful = fulfillment.find(f => f.status === 'fulfilled')?.count ?? 0
    const tot = fulfillment.reduce((s, f) => s + (f.count ?? 0), 0)
    return tot > 0 ? Math.round((ful / tot) * 100) : 0
  })()

  const greet = () => {
    const h = new Date().getHours()
    const p = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
    return `Good ${p}${name ? `, ${name.split(' ')[0]}` : ''}`
  }

  // ── Export helpers ────────────────────────────────────────
  function exportCSV(data, filename) {
    if (!data?.length) return
    const cols = Object.keys(data[0])
    const rows = data.map(row => cols.map(c => JSON.stringify(row[c] ?? '')).join(','))
    const csv  = [cols.join(','), ...rows].join('\n')
    download(csv, `${filename}.csv`, 'text/csv')
  }

  function exportJSON(data, filename) {
    if (!data?.length) return
    download(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json')
  }

  function download(content, filename, type) {
    const blob = new Blob([content], { type })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = filename
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{greet()}</h2>
        <p className="text-sm text-ink/60 mt-0.5">
          All data is aggregated and de-identified. No patient names or personal details.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border shadow-card p-4">
        <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-3">Filters</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-ink/70">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-ivory text-sm text-ink
                         focus:outline-none focus:ring-2 focus:ring-kteal" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-ink/70">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-ivory text-sm text-ink
                         focus:outline-none focus:ring-2 focus:ring-kteal" />
          </div>
          <select value={district} onChange={e => setDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-ivory text-sm text-ink
                       focus:outline-none focus:ring-2 focus:ring-kteal">
            <option value="">All districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={channel} onChange={e => setChannel(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-ivory text-sm text-ink
                       focus:outline-none focus:ring-2 focus:ring-kteal">
            <option value="">All channels</option>
            {['video', 'audio', 'chat'].map(ch => <option key={ch} value={ch}>{ch}</option>)}
          </select>
          {(district || channel) && (
            <button onClick={() => { setDistrict(''); setChannel('') }}
              className="text-sm text-kteal hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Consultations"    value={totalConsults}                  color={C} sub="in period" />
        <StatCard label="Fulfillment rate" value={`${fulfillRate}%`}              color={C} sub="prescriptions fulfilled" />
        <StatCard label="Revenue"          value={fmtAmount(totalRevenue)}        color={C} sub="XOF in period" />
      </div>

      {/* Consult volume chart */}
      <section id="consults" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Consultation volume over time</h3>
        {volume.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={volume} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7DECC" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#15302A99' }}
                tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#15302A99' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#E7DECC', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke={C} strokeWidth={2}
                dot={false} name="Consultations" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* By district + by channel (2 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section id="geo" className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">By district</h3>
          {byDistrict.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDistrict} layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7DECC" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#15302A99' }} allowDecimals={false} />
                <YAxis type="category" dataKey="district" tick={{ fontSize: 11, fill: '#15302A99' }} width={56} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#E7DECC', fontSize: 12 }} />
                <Bar dataKey="count" fill={C} name="Consults" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Prescription fulfillment</h3>
          {fulfillment.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={fulfillment} dataKey="count" nameKey="status"
                  cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`}>
                  {fulfillment.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#E7DECC', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      {/* Top reasons */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Top consultation reasons</h3>
        {topReasons.length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {topReasons.map((r, i) => {
              const max = topReasons[0]?.count ?? 1
              const pct = Math.round((r.count / max) * 100)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-ink/70 w-40 truncate shrink-0">{r.reason ?? '(unspecified)'}</span>
                  <div className="flex-1 bg-ivory rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C }} />
                  </div>
                  <span className="text-xs text-ink/50 w-8 text-right">{r.count}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Revenue chart */}
      <section id="revenue" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Revenue over time (XOF)</h3>
        {revenue.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7DECC" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#15302A99' }}
                tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#15302A99' }}
                tickFormatter={v => fmtAmount(v)} />
              <Tooltip
                contentStyle={{ borderRadius: 8, borderColor: '#E7DECC', fontSize: 12 }}
                formatter={(v) => [fmtAmount(v), 'Revenue']} />
              <Bar dataKey="amount" fill={C} name="Revenue (XOF)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Exports */}
      <section id="exports" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">Export</h3>
        <p className="text-sm text-ink/55 mb-4">
          Downloads contain only the currently filtered, aggregated, de-identified data. No PII.
        </p>
        <div className="flex flex-wrap gap-3">
          <ExportBtn label="Consult volume CSV"  onClick={() => exportCSV(volume,      'klinova_consult_volume')} />
          <ExportBtn label="Consult volume JSON" onClick={() => exportJSON(volume,     'klinova_consult_volume')} />
          <ExportBtn label="By district CSV"     onClick={() => exportCSV(byDistrict,  'klinova_by_district')} />
          <ExportBtn label="Fulfillment CSV"     onClick={() => exportCSV(fulfillment, 'klinova_fulfillment')} />
          <ExportBtn label="Revenue CSV"         onClick={() => exportCSV(revenue,     'klinova_revenue')} />
          <ExportBtn label="Top reasons CSV"     onClick={() => exportCSV(topReasons,  'klinova_top_reasons')} />
        </div>
      </section>

      <MyPaySection userId={userId} />
    </div>
  )
}

function ExportBtn({ label, onClick }) {
  return (
    <button onClick={onClick}
      className="px-4 py-2 rounded-lg border border-kteal text-kteal text-sm font-medium
                 hover:bg-kteal hover:text-white transition-colors focus:outline-none
                 focus:ring-2 focus:ring-kteal focus:ring-offset-1">
      ↓ {label}
    </button>
  )
}

function Empty() {
  return <p className="text-sm text-ink/40 py-4 text-center">No data for the selected period.</p>
}

function fmtAmount(v) {
  if (!v && v !== 0) return '—'
  return new Intl.NumberFormat('fr-TG', { minimumFractionDigits: 0 }).format(v)
}
