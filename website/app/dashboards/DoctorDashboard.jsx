'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, StatusBadge, Alert } from './PatientDashboard'

const C = '#2C6E8F'

export default function DoctorDashboard({ userId, name }) {
  const supabase = createClient()

  // ── Live queue: all waiting consultations ─────────────────
  const { data: queue = [], mutate: mutateQueue } = useSWR(
    'queue-waiting',
    async () => {
      const { data } = await supabase
        .from('consultations')
        .select('*, users!patient_id(full_name, email)')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
      return data ?? []
    },
    { refreshInterval: 5000 }
  )

  // ── Active consultations for this doctor ──────────────────
  const { data: active = [], mutate: mutateActive } = useSWR(
    `active-${userId}`,
    async () => {
      const { data } = await supabase
        .from('consultations')
        .select('*, users!patient_id(full_name, email)')
        .eq('doctor_id', userId)
        .in('status', ['active'])
        .order('created_at', { ascending: false })
      return data ?? []
    },
    { refreshInterval: 5000 }
  )

  // ── Doctor's prescriptions (today) ────────────────────────
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const { data: rxToday = [] } = useSWR(
    `rx-today-${userId}`,
    async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('doctor_id', userId)
        .gte('created_at', todayStart.toISOString())
      return data ?? []
    },
    { refreshInterval: 30000 }
  )

  // ── Pharmacies (for Rx form) ──────────────────────────────
  const { data: pharmacies = [] } = useSWR('pharmacies-list', async () => {
    const { data } = await supabase.from('pharmacies').select('id, name').order('name')
    return data ?? []
  }, { refreshInterval: 60000 })

  // ── Real-time subscription for the queue ──────────────────
  useEffect(() => {
    const ch = supabase
      .channel('doctor-queue-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => {
        mutateQueue(); mutateActive()
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  // ── Claim a consultation ──────────────────────────────────
  async function claimConsult(id) {
    const { error } = await supabase
      .from('consultations')
      .update({ doctor_id: userId, status: 'active' })
      .eq('id', id)
      .eq('status', 'waiting')
    if (!error) { mutateQueue(); mutateActive() }
  }

  async function completeConsult(id) {
    const { error } = await supabase
      .from('consultations')
      .update({ status: 'completed' })
      .eq('id', id)
      .eq('doctor_id', userId)
    if (!error) { mutateActive() }
  }

  // ── Write prescription form ───────────────────────────────
  const [rxForm, setRxForm] = useState({ consultation_id: '', medications: '', notes: '', pharmacy_id: '' })
  const [rxError, setRxError]     = useState('')
  const [rxSuccess, setRxSuccess] = useState(false)
  const [rxSaving, setRxSaving]   = useState(false)

  async function handleWriteRx(e) {
    e.preventDefault()
    setRxError(''); setRxSuccess(false); setRxSaving(true)

    const con = active.find(c => c.id === rxForm.consultation_id)
    if (!con) { setRxError('Select an active consultation.'); setRxSaving(false); return }

    const medsArray = rxForm.medications.split('\n')
      .map(line => line.trim()).filter(Boolean)
      .map(line => ({ name: line }))

    const { error } = await supabase.from('prescriptions').insert({
      doctor_id: userId,
      patient_id: con.patient_id,
      consultation_id: con.id,
      pharmacy_id: rxForm.pharmacy_id || null,
      medications: medsArray,
      notes: rxForm.notes.trim() || null,
      status: 'pending',
    })

    if (error) { setRxError(error.message) } else {
      setRxSuccess(true)
      setRxForm({ consultation_id: '', medications: '', notes: '', pharmacy_id: '' })
    }
    setRxSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{greet(name)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">Patients are counting on you.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Waiting now"       value={queue.length}   color={C} sub="in queue" />
        <StatCard label="Active with me"    value={active.length}  color={C} sub="consultations" />
        <StatCard label="Prescriptions today" value={rxToday.length} color={C} sub="written today" />
      </div>

      {/* Patient queue */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">Patient queue</h3>
          <span className="text-xs text-ink/40">Live · refreshes every 5s</span>
        </div>

        {queue.length === 0 ? (
          <p className="text-sm text-ink/50">No patients waiting right now.</p>
        ) : (
          <div className="space-y-3">
            {queue.map(c => (
              <div key={c.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-ivory">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {c.users?.full_name ?? c.users?.email ?? 'Patient'}
                  </p>
                  <p className="text-xs text-ink/55 mt-0.5 truncate">{c.reason}</p>
                  <p className="text-xs text-ink/40 mt-1">
                    {c.channel} · {fmtTime(c.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => claimConsult(c.id)}
                  className="shrink-0 px-4 py-1.5 rounded-lg text-white text-sm font-medium
                             hover:opacity-90 active:scale-[0.98]"
                  style={{ background: C }}>
                  Start consult
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active consultations */}
      {active.length > 0 && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Active consultations</h3>
          <div className="space-y-3">
            {active.map(c => (
              <div key={c.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-[#2C6E8F]/20 bg-[#E8F0F5]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {c.users?.full_name ?? c.users?.email ?? 'Patient'}
                  </p>
                  <p className="text-xs text-ink/55 mt-0.5">{c.reason}</p>
                </div>
                <button
                  onClick={() => completeConsult(c.id)}
                  className="shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium
                             border border-[#2C6E8F] text-[#2C6E8F] hover:bg-[#2C6E8F] hover:text-white">
                  Complete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Write prescription */}
      <section id="rx" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">Write a prescription</h3>
        <p className="text-sm text-ink/55 mb-4">Link to an active consultation, list medications, and choose a pharmacy.</p>

        {rxError   && <Alert type="error"   msg={rxError} />}
        {rxSuccess && <Alert type="success" msg="Prescription created and sent to the pharmacy." />}

        <form onSubmit={handleWriteRx} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Active consultation</label>
            <select
              required value={rxForm.consultation_id}
              onChange={e => setRxForm(f => ({ ...f, consultation_id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                         focus:outline-none focus:ring-2">
              <option value="">Select patient…</option>
              {active.map(c => (
                <option key={c.id} value={c.id}>
                  {c.users?.full_name ?? 'Patient'} · {c.channel}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Medications <span className="text-ink/40 font-normal">(one per line: name, dosage, frequency)</span>
            </label>
            <textarea required rows={4}
              value={rxForm.medications}
              onChange={e => setRxForm(f => ({ ...f, medications: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                         focus:outline-none focus:ring-2 resize-none"
              placeholder={"Amoxicillin 500mg 3×/day 7 days\nParacetamol 1g as needed"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Notes (optional)</label>
            <input type="text"
              value={rxForm.notes}
              onChange={e => setRxForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                         focus:outline-none focus:ring-2"
              placeholder="Rest, drink fluids…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Send to pharmacy (optional)</label>
            <select
              value={rxForm.pharmacy_id}
              onChange={e => setRxForm(f => ({ ...f, pharmacy_id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                         focus:outline-none focus:ring-2">
              <option value="">Patient chooses pharmacy</option>
              {pharmacies.map(ph => (
                <option key={ph.id} value={ph.id}>{ph.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={rxSaving}
            className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm
                       hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
            style={{ background: C }}>
            {rxSaving ? 'Sending…' : 'Send prescription'}
          </button>
        </form>
      </section>
    </div>
  )
}

function greet(name) {
  const h = new Date().getHours()
  const p = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${p}${name ? `, Dr. ${name.split(' ').slice(-1)[0]}` : ''}`
}

function fmtTime(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ago`
}
