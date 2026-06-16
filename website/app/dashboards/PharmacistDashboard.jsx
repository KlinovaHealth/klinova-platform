'use client'
import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, StatusBadge } from './PatientDashboard'

const C = '#D99A2B'

export default function PharmacistDashboard({ userId, name, pharmacyId }) {
  const supabase = createClient()

  // Prescriptions for this pharmacy
  const { data: prescriptions = [], mutate } = useSWR(
    pharmacyId ? `rx-pharmacy-${pharmacyId}` : null,
    async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select(`
          *,
          users!patient_id(full_name, email),
          users!doctor_id(full_name)
        `)
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
    { refreshInterval: 8000 }
  )

  // Real-time subscription
  useEffect(() => {
    if (!pharmacyId) return
    const ch = supabase
      .channel(`pharmacy-rx-${pharmacyId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'prescriptions',
        filter: `pharmacy_id=eq.${pharmacyId}`,
      }, () => mutate())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [pharmacyId])

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('prescriptions')
      .update({ status })
      .eq('id', id)
      .eq('pharmacy_id', pharmacyId) // RLS double-check
    if (!error) mutate()
  }

  const pending   = prescriptions.filter(p => p.status === 'pending').length
  const ready     = prescriptions.filter(p => p.status === 'ready').length
  const fulfilled = prescriptions.filter(p => p.status === 'fulfilled').length

  const greet = () => {
    const h = new Date().getHours()
    const p = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
    return `Good ${p}${name ? `, ${name.split(' ')[0]}` : ''}`
  }

  if (!pharmacyId) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink/60">Your account is not linked to a pharmacy yet.</p>
        <p className="text-xs text-ink/40 mt-1">Ask your administrator to assign a pharmacy_id.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{greet()}</h2>
        <p className="text-sm text-ink/60 mt-0.5">Incoming prescriptions — live.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending"   value={pending}   color={C} sub="to prepare" />
        <StatCard label="Ready"     value={ready}     color={C} sub="for pickup" />
        <StatCard label="Fulfilled" value={fulfilled} color={C} sub="today (all time shown)" />
      </div>

      {/* Incoming prescriptions */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">Incoming prescriptions</h3>
          <span className="text-xs text-ink/40">Live · refreshes every 8s</span>
        </div>

        {prescriptions.length === 0 ? (
          <p className="text-sm text-ink/50">No prescriptions yet.</p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map(rx => (
              <RxCard key={rx.id} rx={rx} onUpdate={updateStatus} color={C} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function RxCard({ rx, onUpdate, color }) {
  const patientName = rx.users?.full_name ?? rx.users?.email ?? 'Patient'
  const doctorName  = rx.users_1?.full_name ?? '—'
  const meds        = formatMeds(rx.medications)

  return (
    <div className="p-4 rounded-lg border border-border bg-ivory">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={rx.status} />
            <span className="text-xs text-ink/40">{fmtDate(rx.created_at)}</span>
          </div>
          <p className="text-sm font-medium text-ink">{patientName}</p>
          <p className="text-xs text-ink/50 mt-0.5">Prescribed by Dr. {doctorName}</p>
          <p className="text-xs text-ink/70 mt-2 leading-relaxed">{meds}</p>
          {rx.notes && <p className="text-xs text-ink/50 mt-1 italic">{rx.notes}</p>}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {rx.status === 'pending' && (
            <button
              onClick={() => onUpdate(rx.id, 'ready')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90"
              style={{ background: color }}>
              Mark ready
            </button>
          )}
          {rx.status === 'ready' && (
            <button
              onClick={() => onUpdate(rx.id, 'fulfilled')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90"
              style={{ background: '#0E6B4F' }}>
              Mark fulfilled
            </button>
          )}
          {rx.status === 'fulfilled' && (
            <span className="text-xs text-ink/40 text-right">Done</span>
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

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
