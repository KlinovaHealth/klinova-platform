'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, Alert, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'

const C = '#0E6B4F'

const emptyVitals = { consultationId: '', patientId: '', heartRate: '', bpSys: '', bpDia: '', temperature: '', weight: '', notes: '' }

export default function NurseDashboard({ userId, name }) {
  const supabase = createClient()
  const { t } = useLanguage()

  const { data: waiting = 0 } = useSWR('nurse-waiting', async () => {
    const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('status', 'waiting')
    return count ?? 0
  }, { refreshInterval: 15000 })

  const { data: active = 0 } = useSWR('nurse-active', async () => {
    const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('status', 'active')
    return count ?? 0
  }, { refreshInterval: 15000 })

  const today = new Date().toISOString().slice(0, 10)
  const { data: vitalsToday = 0 } = useSWR('nurse-vitals-today', async () => {
    const { count } = await supabase.from('vitals').select('*', { count: 'exact', head: true })
      .eq('recorded_by', userId).gte('created_at', today)
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: triageQueue = [], mutate: mutateQueue } = useSWR('nurse-triage-queue', async () => {
    const { data } = await supabase.from('consultations')
      .select('id, reason, channel, created_at').eq('status', 'waiting').order('created_at', { ascending: true })
    return data ?? []
  }, { refreshInterval: 15000 })

  const [form, setForm] = useState(emptyVitals)
  const [saving, setSaving] = useState(false)
  const [vitalError, setVitalError]   = useState('')
  const [vitalSuccess, setVitalSuccess] = useState(false)

  async function handleVitalsSubmit(e) {
    e.preventDefault()
    setSaving(true); setVitalError(''); setVitalSuccess(false)
    const { error } = await supabase.from('vitals').insert({
      consultation_id:   form.consultationId || null,
      patient_id:        form.patientId      || null,
      recorded_by:       userId,
      heart_rate:        form.heartRate   ? parseInt(form.heartRate)     : null,
      blood_pressure_sys:form.bpSys       ? parseInt(form.bpSys)        : null,
      blood_pressure_dia:form.bpDia       ? parseInt(form.bpDia)        : null,
      temperature:       form.temperature ? parseFloat(form.temperature) : null,
      weight:            form.weight      ? parseFloat(form.weight)      : null,
      notes:             form.notes || null,
    })
    if (error) { setVitalError(error.message) } else {
      setVitalSuccess(true); setForm(emptyVitals); mutateQueue()
    }
    setSaving(false)
  }

  const inputCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#0E6B4F] focus:border-[#0E6B4F]`

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{getGreeting(name, t)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">{t('nurse.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('nurse.stats.waitingPatients')} value={waiting}     color={C} sub={t('nurse.stats.waitingPatientsSub')} />
        <StatCard label={t('nurse.stats.activeConsults')}  value={active}      color={C} sub={t('nurse.stats.activeConsultsSub')} />
        <StatCard label={t('nurse.stats.vitalsToday')}     value={vitalsToday} color={C} sub={t('nurse.stats.vitalsTodaySub')} />
      </div>

      <section id="triage" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">{t('nurse.triageQueue')}</h3>
        {triageQueue.length === 0 ? (
          <p className="text-sm text-ink/50">{t('nurse.noPatientsWaiting')}</p>
        ) : (
          <Table
            cols={[t('col.reason'), t('col.channel'), t('col.waitingSince')]}
            rows={triageQueue.map(c => [
              c.reason ?? '—',
              t(`channels.${c.channel}`) !== `channels.${c.channel}` ? t(`channels.${c.channel}`) : (c.channel ?? '—'),
              fmtDate(c.created_at),
            ])}
          />
        )}
      </section>

      <section id="vitals" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">{t('nurse.recordVitals')}</h3>
        <p className="text-sm text-ink/55 mb-4">{t('nurse.recordVitalsDesc')}</p>

        {vitalError   && <Alert type="error"   msg={vitalError} />}
        {vitalSuccess && <Alert type="success" msg={t('nurse.vitalsSuccess')} />}

        <form onSubmit={handleVitalsSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VField label={t('nurse.form.patientId')}>
            <input type="text" value={form.patientId}
              onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              className={inputCls} placeholder={t('nurse.form.patientIdPlaceholder')} />
          </VField>
          <VField label={t('nurse.form.heartRate')}>
            <input type="number" value={form.heartRate}
              onChange={e => setForm(f => ({ ...f, heartRate: e.target.value }))}
              className={inputCls} placeholder={t('nurse.form.heartRatePlaceholder')} />
          </VField>
          <VField label={t('nurse.form.bpSys')}>
            <input type="number" value={form.bpSys}
              onChange={e => setForm(f => ({ ...f, bpSys: e.target.value }))}
              className={inputCls} placeholder={t('nurse.form.bpSysPlaceholder')} />
          </VField>
          <VField label={t('nurse.form.bpDia')}>
            <input type="number" value={form.bpDia}
              onChange={e => setForm(f => ({ ...f, bpDia: e.target.value }))}
              className={inputCls} placeholder={t('nurse.form.bpDiaPlaceholder')} />
          </VField>
          <VField label={t('nurse.form.temperature')}>
            <input type="number" step="0.1" value={form.temperature}
              onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
              className={inputCls} placeholder={t('nurse.form.temperaturePlaceholder')} />
          </VField>
          <VField label={t('nurse.form.weight')}>
            <input type="number" step="0.1" value={form.weight}
              onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              className={inputCls} placeholder={t('nurse.form.weightPlaceholder')} />
          </VField>
          <VField label={t('nurse.form.notes')} className="sm:col-span-2">
            <textarea rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className={inputCls + ' resize-none'} placeholder={t('nurse.form.notesPlaceholder')} />
          </VField>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm
                         hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
              style={{ background: C }}>
              {saving ? t('nurse.saving') : t('nurse.saveVitals')}
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

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}
