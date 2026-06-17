'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'

const C = '#0E6B4F'
const CHANNELS = ['video', 'audio', 'chat']

export default function PatientDashboard({ userId, name }) {
  const supabase = createClient()
  const { t } = useLanguage()

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

  const [reason, setReason]       = useState('')
  const [channel, setChannel]     = useState('video')
  const [submitting, setSubmitting] = useState(false)
  const [talkError, setTalkError]   = useState('')
  const [talkSuccess, setTalkSuccess] = useState(false)

  async function handleTalkToDoctor(e) {
    e.preventDefault()
    setSubmitting(true); setTalkError(''); setTalkSuccess(false)
    const { error } = await supabase.from('consultations').insert({
      patient_id: userId, status: 'waiting', reason: reason.trim(), channel,
    })
    if (error) { setTalkError(error.message) } else {
      setTalkSuccess(true); setReason(''); setChannel('video')
      mutateCon()
    }
    setSubmitting(false)
  }

  const waiting = consultations.filter(c => c.status === 'waiting').length
  const active  = consultations.filter(c => c.status === 'active').length
  const pendRx  = prescriptions.filter(p => p.status === 'pending').length

  const greeting = getGreeting(name, t)

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{greeting}</h2>
        <p className="text-sm text-ink/60 mt-0.5">{t('patient.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('patient.stats.consultations')} value={consultations.length} color={C} sub={t('patient.stats.consultationsSub')} />
        <StatCard label={t('patient.stats.inProgress')}    value={waiting + active}     color={C} sub={t('patient.stats.inProgressSub')} />
        <StatCard label={t('patient.stats.pendingRx')}     value={pendRx}               color={C} sub={t('patient.stats.pendingRxSub')} />
      </div>

      <section id="consult" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">{t('patient.talkToDoctor')}</h3>
        <p className="text-sm text-ink/55 mb-4">{t('patient.talkToDoctorDesc')}</p>

        {talkError   && <Alert type="error"   msg={talkError} />}
        {talkSuccess && <Alert type="success" msg={t('patient.consultSuccess')} />}

        <form onSubmit={handleTalkToDoctor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('patient.reasonLabel')}</label>
            <textarea
              required value={reason} onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                         focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': C }}
              placeholder={t('patient.reasonPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">{t('patient.channelLabel')}</label>
            <div className="flex gap-2">
              {CHANNELS.map(ch => (
                <button key={ch} type="button"
                  onClick={() => setChannel(ch)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
                              ${channel === ch
                                ? 'border-transparent text-white'
                                : 'border-border text-ink/60 hover:border-ink/30'}`}
                  style={channel === ch ? { background: C } : {}}>
                  {t(`channels.${ch}`)}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm
                       hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: C }}>
            {submitting ? t('patient.sending') : t('patient.requestConsult')}
          </button>
        </form>
      </section>

      <section id="rx" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">{t('patient.myConsultations')}</h3>
        {consultations.length === 0 ? (
          <p className="text-sm text-ink/50">{t('patient.noConsultations')}</p>
        ) : (
          <Table
            cols={[t('col.date'), t('col.reason'), t('col.channel'), t('col.status')]}
            rows={consultations.map(c => [
              fmtDate(c.created_at),
              c.reason ?? '—',
              c.channel ?? '—',
              <StatusBadge key={c.id} status={c.status} />,
            ])}
          />
        )}
      </section>

      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">{t('patient.myPrescriptions')}</h3>
        {prescriptions.length === 0 ? (
          <p className="text-sm text-ink/50">{t('patient.noPrescriptions')}</p>
        ) : (
          <Table
            cols={[t('col.date'), t('col.pharmacy'), t('col.medications'), t('col.status')]}
            rows={prescriptions.map(p => [
              fmtDate(p.created_at),
              p.pharmacies?.name ?? '—',
              fmtMeds(p.medications),
              <StatusBadge key={p.id} status={p.status} />,
            ])}
          />
        )}
      </section>

      <section id="pharmacy" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">{t('patient.findPharmacy')}</h3>
        {pharmacies.length === 0 ? (
          <p className="text-sm text-ink/50">{t('patient.noPharmacies')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pharmacies.map(ph => (
              <div key={ph.id} className="border border-border rounded-lg p-4">
                <p className="font-medium text-ink text-sm">{ph.name}</p>
                <p className="text-xs text-ink/50 mt-0.5">{ph.district ?? ''} {ph.address ?? ''}</p>
                {ph.phone && <p className="text-xs text-ink/50">{ph.phone}</p>}
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full
                  ${ph.open_now ? 'bg-kgreen-light text-kgreen' : 'bg-red-50 text-red-600'}`}>
                  {ph.open_now ? t('patient.open') : t('patient.closed')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="payments" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">{t('patient.payments')}</h3>
        <p className="text-sm text-ink/50">{t('patient.paymentsSoon')}</p>
      </section>

      <MyPaySection userId={userId} />
    </div>
  )
}

// ── Shared helpers (exported for other dashboards) ──────────────────────────

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
  const { t } = useLanguage()
  const map = {
    waiting:   { bg: '#F4E2BC', color: '#D99A2B' },
    active:    { bg: '#E3EFE8', color: '#0A5440' },
    completed: { bg: '#E3EFE8', color: '#0E6B4F' },
    cancelled: { bg: '#FBEEE8', color: '#CF5A3C' },
    pending:   { bg: '#F4E2BC', color: '#D99A2B' },
    ready:     { bg: '#E3EFE8', color: '#0A5440' },
    fulfilled: { bg: '#E3EFE8', color: '#0E6B4F' },
  }
  const s = map[status] ?? { bg: '#F5EFE3', color: '#15302A' }
  const label = t(`status.${status}`) !== `status.${status}` ? t(`status.${status}`) : status
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {label}
    </span>
  )
}

export function Alert({ type, msg }) {
  const styles = {
    error:   'bg-[#FBEEE8] border-[#CF5A3C]/20 text-[#CF5A3C]',
    success: 'bg-[#E3EFE8] border-[#0E6B4F]/20 text-[#0E6B4F]',
  }
  return (
    <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}>{msg}</div>
  )
}

export function getGreeting(name, t) {
  const h = new Date().getHours()
  const key = h < 12 ? 'goodMorning' : h < 17 ? 'goodAfternoon' : 'goodEvening'
  return `${t(key)}${name ? `, ${name.split(' ')[0]}` : ''}`
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
