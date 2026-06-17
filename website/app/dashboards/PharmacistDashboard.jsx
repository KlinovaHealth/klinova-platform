'use client'
import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, StatusBadge, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'

const C = '#D99A2B'

export default function PharmacistDashboard({ userId, name, pharmacyId }) {
  const supabase = createClient()
  const { t } = useLanguage()

  const { data: prescriptions = [], mutate } = useSWR(
    pharmacyId ? `rx-pharmacy-${pharmacyId}` : null,
    async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select(`*, users!patient_id(full_name, email), users!doctor_id(full_name)`)
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
    { refreshInterval: 8000 }
  )

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
      .eq('pharmacy_id', pharmacyId)
    if (!error) mutate()
  }

  const pending   = prescriptions.filter(p => p.status === 'pending').length
  const ready     = prescriptions.filter(p => p.status === 'ready').length
  const fulfilled = prescriptions.filter(p => p.status === 'fulfilled').length

  if (!pharmacyId) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink/60">{t('pharmacist.notLinked')}</p>
        <p className="text-xs text-ink/40 mt-1">{t('pharmacist.askAdmin')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{getGreeting(name, t)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">{t('pharmacist.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('pharmacist.stats.pending')}   value={pending}   color={C} sub={t('pharmacist.stats.pendingSub')} />
        <StatCard label={t('pharmacist.stats.ready')}     value={ready}     color={C} sub={t('pharmacist.stats.readySub')} />
        <StatCard label={t('pharmacist.stats.fulfilled')} value={fulfilled} color={C} sub={t('pharmacist.stats.fulfilledSub')} />
      </div>

      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">{t('pharmacist.incomingRx')}</h3>
          <span className="text-xs text-ink/40">{t('pharmacist.liveRefresh8s')}</span>
        </div>

        {prescriptions.length === 0 ? (
          <p className="text-sm text-ink/50">{t('pharmacist.noRx')}</p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map(rx => (
              <RxCard key={rx.id} rx={rx} onUpdate={updateStatus} color={C} t={t} />
            ))}
          </div>
        )}
      </section>

      <MyPaySection userId={userId} />
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
            <span className="text-xs text-ink/40">{fmtDate(rx.created_at)}</span>
          </div>
          <p className="text-sm font-medium text-ink">{patientName}</p>
          <p className="text-xs text-ink/50 mt-0.5">{t('pharmacist.prescribedBy')} {t('drTitle')} {doctorName}</p>
          <p className="text-xs text-ink/70 mt-2 leading-relaxed">{meds}</p>
          {rx.notes && <p className="text-xs text-ink/50 mt-1 italic">{rx.notes}</p>}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {rx.status === 'pending' && (
            <button onClick={() => onUpdate(rx.id, 'ready')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90"
              style={{ background: color }}>
              {t('pharmacist.markReady')}
            </button>
          )}
          {rx.status === 'ready' && (
            <button onClick={() => onUpdate(rx.id, 'fulfilled')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90"
              style={{ background: '#0E6B4F' }}>
              {t('pharmacist.markFulfilled')}
            </button>
          )}
          {rx.status === 'fulfilled' && (
            <span className="text-xs text-ink/40 text-right">{t('pharmacist.done')}</span>
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
