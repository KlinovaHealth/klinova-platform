'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, Alert } from './PatientDashboard'
import MyPaySection from './MyPaySection'

const C = '#2E7D6B'

function getGreeting(name) {
  const h = new Date().getHours()
  const p = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${p}${name ? `, ${name.split(' ')[0]}` : ''}`
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}

const emptyVitals = { consultationId: '', patientId: '', heartRate: '', bpSys: '', bpDia: '', temperature: '', weight: '', notes: '' }

export default function NurseDashboard({ userId, name }) {
  const supabase = createClient()

  const { data: waiting = 0 } = useSWR('nurse-waiting', async () => {
    const { count } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'waiting')
    return count ?? 0
  }, { refreshInterval: 15000 })

  const { data: active = 0 } = useSWR('nurse-active', async () => {
    const { count } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    return count ?? 0
  }, { refreshInterval: 15000 })

  const today = new Date().toISOString().slice(0, 10)
  const { data: vitalsToday = 0 } = useSWR('nurse-vitals-today', async () => {
    const { count } = await supabase
      .from('vitals')
      .select('*', { count: 'exact', head: true })
      .eq('recorded_by', userId)
      .gte('created_at', today)
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: triageQueue = [], mutate: mutateQueue } = useSWR('nurse-triage-queue', async () => {
    const { data } = await supabase
      .from('consultations')
      .select('id, reason, channel, created_at')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true })
    return data ?? []
  }, { refreshInterval: 15000 })

  const [form, setForm] = useState(emptyVitals)
  const [saving, setSaving] = useState(false)
  const [vitalError, setVitalError] = useState('')
  const [vitalSuccess, setVitalSuccess] = useState(false)

  async function handleVitalsSubmit(e) {
    e.preventDefault()
    setSaving(true); setVitalError(''); setVitalSuccess(false)
    const { error } = await supabase.from('vitals').insert({
      consultation_id: form.consultationId || null,
      patient_id:      form.patientId || null,
      recorded_by:     userId,
      heart_rate:      form.heartRate   ? parseInt(form.heartRate)        : null,
      blood_pressure_sys: form.bpSys   ? parseInt(form.bpSys)            : null,
      blood_pressure_dia: form.bpDia   ? parseInt(form.bpDia)            : null,
      temperature:     form.temperature ? parseFloat(form.temperature)    : null,
      weight:          form.weight      ? parseFloat(form.weight)         : null,
      notes:           form.notes || null,
    })
    if (error) {
      setVitalError(error.message)
    } else {
      setVitalSuccess(true)
      setForm(emptyVitals)
      mutateQueue()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{getGreeting(name)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">Patient care and triage.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Waiting patients" value={waiting}     color={C} sub="in queue" />
        <StatCard label="Active consults"  value={active}      color={C} sub="in progress" />
        <StatCard label="Vitals recorded"  value={vitalsToday} color={C} sub="today" />
      </div>

      <section id="triage" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Triage Queue</h3>
        {triageQueue.length === 0 ? (
          <p className="text-sm text-ink/50">No patients waiting.</p>
        ) : (
          <Table
            cols={['Reason', 'Channel', 'Waiting since']}
            rows={triageQueue.map(c => [
              c.reason ?? '—',
              c.channel ?? '—',
              fmtDate(c.created_at),
            ])}
          />
        )}
      </section>

      <section id="vitals" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">Record Vitals</h3>
        <p className="text-sm text-ink/55 mb-4">Enter patient measurements for the current consultation.</p>

        {vitalError   && <Alert type="error"   msg={vitalError} />}
        {vitalSuccess && <Alert type="success" msg="Vitals recorded successfully." />}

        <form onSubmit={handleVitalsSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VField label="Patient ID">
            <input type="text" value={form.patientId}
              onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              className={inputCls} placeholder="UUID of patient" />
          </VField>
          <VField label="Heart rate (bpm)">
            <input type="number" value={form.heartRate}
              onChange={e => setForm(f => ({ ...f, heartRate: e.target.value }))}
              className={inputCls} placeholder="72" />
          </VField>
          <VField label="BP Systolic (mmHg)">
            <input type="number" value={form.bpSys}
              onChange={e => setForm(f => ({ ...f, bpSys: e.target.value }))}
              className={inputCls} placeholder="120" />
          </VField>
          <VField label="BP Diastolic (mmHg)">
            <input type="number" value={form.bpDia}
              onChange={e => setForm(f => ({ ...f, bpDia: e.target.value }))}
              className={inputCls} placeholder="80" />
          </VField>
          <VField label="Temperature (°C)">
            <input type="number" step="0.1" value={form.temperature}
              onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
              className={inputCls} placeholder="37.0" />
          </VField>
          <VField label="Weight (kg)">
            <input type="number" step="0.1" value={form.weight}
              onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              className={inputCls} placeholder="70.0" />
          </VField>
          <VField label="Notes" className="sm:col-span-2">
            <textarea rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className={inputCls + ' resize-none'} placeholder="Optional clinical notes…" />
          </VField>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm
                         hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
              style={{ background: C }}>
              {saving ? 'Saving…' : 'Save vitals'}
            </button>
          </div>
        </form>
      </section>

      <MyPaySection userId={userId} />
    </div>
  )
}

function VField({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#2E7D6B] focus:border-[#2E7D6B]`
