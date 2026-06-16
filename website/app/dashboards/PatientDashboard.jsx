'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import MyPaySection from './MyPaySection'

const C = '#0E6B4F'
const CHANNELS = ['video', 'audio', 'chat']

export default function PatientDashboard({ userId, name }) {
  const supabase = createClient()
  const greeting = getGreeting(name)

  // ── Live data ─────────────────────────────────────────────
  const { data: consultations = [], mutate: mutateCon } = useSWR(
    `consultations-${userId}`,
    async () => {
      const { data } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      return data ?? []
    },
    { refreshInterval: 8000 }
  )

  const { data: prescriptions = [] } = useSWR(
    `prescriptions-patient-${userId}`,
    async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select('*, pharmacies(name)')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      return data ?? []
    },
    { refreshInterval: 10000 }
  )

  const { data: pharmacies = [] } = useSWR(
    'pharmacies-list',
    async () => {
      const { data } = await supabase.from('pharmacies').select('*').order('name')
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  // Real-time subscription for this patient's consultations
  useEffect(() => {
    const channel = supabase
      .channel(`patient-consultations-${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'consultations',
        filter: `patient_id=eq.${userId}`,
      }, () => mutateCon())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId])

  // ── "Talk to a doctor" form state ─────────────────────────
  const [reason, setReason]     = useState('')
  const [channel, setChannel]   = useState('video')
  const [submitting, setSubmitting] = useState(false)
  const [talkError, setTalkError]   = useState('')
  const [talkSuccess, setTalkSuccess] = useState(false)

  async function handleTalkToDoctor(e) {
    e.preventDefault()
    setSubmitting(true); setTalkError(''); setTalkSuccess(false)
    const { error } = await supabase.from('consultations').insert({
      patient_id: userId,
      status: 'waiting',
      reason: reason.trim(),
      channel,
    })
    if (error) { setTalkError(error.message) } else {
      setTalkSuccess(true); setReason(''); setChannel('video')
      mutateCon()
    }
    setSubmitting(false)
  }

  const waiting  = consultations.filter(c => c.status === 'waiting').length
  const active   = consultations.filter(c => c.status === 'active').length
  const pendRx   = prescriptions.filter(p => p.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{greeting}</h2>
        <p className="text-sm text-ink/60 mt-0.5">Your health, at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Consultations"    value={consultations.length} color={C} sub="total" />
        <StatCard label="In progress"      value={waiting + active}     color={C} sub="waiting or active" />
        <StatCard label="Pending Rx"       value={pendRx}               color={C} sub="awaiting pickup" />
      </div>

      {/* Talk to a doctor */}
      <section id="consult" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">Talk to a doctor</h3>
        <p className="text-sm text-ink/55 mb-4">Describe your concern and choose how to connect.</p>

        {talkError && <Alert type="error" msg={talkError} />}
        {talkSuccess && <Alert type="success" msg="Your request has been sent — a doctor will connect with you shortly." />}

        <form onSubmit={handleTalkToDoctor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Reason / symptoms</label>
            <textarea
              required value={reason} onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                         focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': C }}
              placeholder="E.g. I have had a fever for two days…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Channel</label>
            <div className="flex gap-2">
              {CHANNELS.map(ch => (
                <button key={ch} type="button"
                  onClick={() => setChannel(ch)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
                              ${channel === ch
                                ? 'border-transparent text-white'
                                : 'border-border text-ink/60 hover:border-ink/30'}`}
                  style={channel === ch ? { background: C } : {}}>
                  {ch.charAt(0).toUpperCase() + ch.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm
                       hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: C }}>
            {submitting ? 'Sending…' : 'Request consultation'}
          </button>
        </form>
      </section>

      {/* My consultations */}
      <section id="rx" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">My consultations</h3>
        {consultations.length === 0 ? (
          <p className="text-sm text-ink/50">No consultations yet.</p>
        ) : (
          <Table
            cols={['Date', 'Reason', 'Channel', 'Status']}
            rows={consultations.map(c => [
              fmtDate(c.created_at),
              c.reason ?? '—',
              c.channel ?? '—',
              <StatusBadge key={c.id} status={c.status} />,
            ])}
          />
        )}
      </section>

      {/* Prescriptions */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">My prescriptions</h3>
        {prescriptions.length === 0 ? (
          <p className="text-sm text-ink/50">No prescriptions yet.</p>
        ) : (
          <Table
            cols={['Date', 'Pharmacy', 'Medications', 'Status']}
            rows={prescriptions.map(p => [
              fmtDate(p.created_at),
              p.pharmacies?.name ?? '—',
              fmtMeds(p.medications),
              <StatusBadge key={p.id} status={p.status} />,
            ])}
          />
        )}
      </section>

      {/* Find pharmacy */}
      <section id="pharmacy" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Find a pharmacy</h3>
        {pharmacies.length === 0 ? (
          <p className="text-sm text-ink/50">No pharmacies on record yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pharmacies.map(ph => (
              <div key={ph.id} className="border border-border rounded-lg p-4">
                <p className="font-medium text-ink text-sm">{ph.name}</p>
                <p className="text-xs text-ink/50 mt-0.5">{ph.district ?? ''} {ph.address ?? ''}</p>
                {ph.phone && <p className="text-xs text-ink/50">{ph.phone}</p>}
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full
                  ${ph.open_now ? 'bg-kgreen-light text-kgreen' : 'bg-red-50 text-red-600'}`}>
                  {ph.open_now ? 'Open' : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payments placeholder */}
      <section id="payments" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">Payments</h3>
        <p className="text-sm text-ink/50">Mobile money payments — coming soon.</p>
      </section>

      <MyPaySection userId={userId} />
    </div>
  )
}

// ── Shared helpers ──────────────────────────────────────────
export function StatCard({ label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-5">
      <p className="text-3xl font-bold" style={{ fontFamily: "'Fraunces', Georgia, serif", color }}>
        {value ?? '—'}
      </p>
      <p className="text-sm font-medium text-ink mt-1">{label}</p>
      {sub && <p className="text-xs text-ink/45 mt-0.5">{sub}</p>}
    </div>
  )
}

export function Table({ cols, rows }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {cols.map(c => (
              <th key={c} className="text-left px-2 pb-2 text-xs font-semibold text-ink/50 uppercase tracking-wide">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-ivory/50">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-2.5 text-ink/80 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    waiting:   { bg: '#FBF4E5', color: '#D99A2B', label: 'Waiting'   },
    active:    { bg: '#E8F0F5', color: '#2C6E8F', label: 'Active'    },
    completed: { bg: '#E8F3EF', color: '#0E6B4F', label: 'Completed' },
    cancelled: { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' },
    pending:   { bg: '#FBF4E5', color: '#D99A2B', label: 'Pending'   },
    ready:     { bg: '#E8F0F5', color: '#2C6E8F', label: 'Ready'     },
    fulfilled: { bg: '#E8F3EF', color: '#0E6B4F', label: 'Fulfilled' },
  }
  const s = map[status] ?? { bg: '#F5EFE3', color: '#15302A', label: status }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export function Alert({ type, msg }) {
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-[#E8F3EF] border-[#0E6B4F]/20 text-[#0E6B4F]',
  }
  return (
    <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}>{msg}</div>
  )
}

function getGreeting(name) {
  const h = new Date().getHours()
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${part}${name ? `, ${name.split(' ')[0]}` : ''}`
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtMeds(meds) {
  if (!meds) return '—'
  if (Array.isArray(meds)) return meds.map(m => m.name ?? m).join(', ')
  if (typeof meds === 'string') return meds
  return JSON.stringify(meds)
}
