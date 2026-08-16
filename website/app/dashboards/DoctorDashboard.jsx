'use client'
import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, StatusBadge, Alert, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'
import WhatsAppTriageSection from './WhatsAppTriageSection'
import AppointmentsSection from './AppointmentsSection'
import ClinicReportsSection from './ClinicReportsSection'

const C = {
  gold:   '#D99A2B',
  green:  '#0E6B4F',
  deep:   '#0A5440',
  ink:    '#15302A',
  coral:  '#CF5A3C',
  amber:  '#E0A23B',
  soft:   '#E3EFE8',
  ivory:  '#F5EFE3',
  sand:   '#EDE4D2',
  line:   '#E7DECC',
  mute:   '#6E7F76',
}

const DATE_VIEWS = ['today', 'this_week', 'last_2_weeks', 'last_month']
const DATE_LABELS = { today: 'Today', this_week: 'This week', last_2_weeks: 'Past 2 weeks', last_month: 'Past month' }

function dateRange(view) {
  const now = new Date()
  const sod = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
  const eod = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x }
  const monday = (d) => { const x = new Date(d); x.setDate(x.getDate() - (x.getDay() || 7) + 1); return sod(x) }
  switch (view) {
    case 'today':       return { start: sod(now), end: eod(now) }
    case 'this_week':   return { start: monday(now), end: eod(now) }
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

export default function DoctorDashboard({ userId, name }) {
  const supabase = createClient()
  const { t } = useLanguage()
  const [mainTab, setMainTab]   = useState('overview')
  const [dateView, setDateView] = useState('today')

  const { data: queue = [], mutate: mutateQueue } = useSWR(
    'queue-waiting',
    async () => {
      const { data } = await supabase
        .from('consultations')
        .select('*, users!patient_id(full_name, email, phone)')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
      return data ?? []
    },
    { refreshInterval: 5000 }
  )

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

  const { data: allConsults = [], mutate: mutateConsults } = useSWR(
    `all-consults-${userId}`,
    async () => {
      const { data } = await supabase
        .from('consultations')
        .select('*, users!patient_id(full_name, email, created_at)')
        .eq('doctor_id', userId)
        .order('created_at', { ascending: false })
        .limit(500)
      return data ?? []
    },
    { refreshInterval: 15000 }
  )

  const { data: allRx = [], mutate: mutateRx } = useSWR(
    `all-rx-${userId}`,
    async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select('*, users!patient_id(full_name, email)')
        .eq('doctor_id', userId)
        .order('created_at', { ascending: false })
        .limit(200)
      return data ?? []
    },
    { refreshInterval: 15000 }
  )

  const { data: pharmacies = [] } = useSWR('pharmacies-list', async () => {
    const { data } = await supabase.from('pharmacies').select('id, name').order('name')
    return data ?? []
  }, { refreshInterval: 60000 })

  useEffect(() => {
    const ch = supabase
      .channel('doctor-queue-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => {
        mutateQueue(); mutateActive(); mutateConsults()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => {
        mutateRx()
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function claimConsult(id) {
    const patient = queue.find(c => c.id === id)
    const { error } = await supabase
      .from('consultations')
      .update({ doctor_id: userId, status: 'active' })
      .eq('id', id).eq('status', 'waiting')
    if (!error) {
      const phone = patient?.users?.phone
      if (phone) {
        fetch('/api/whatsapp/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: phone, type: 'consultation_active', payload: { name: patient.users.full_name ?? 'there', lang: 'fr' } }),
        }).catch(() => {})
      }
      mutateQueue(); mutateActive()
    }
  }

  async function completeConsult(id) {
    await supabase.from('consultations').update({ status: 'completed' }).eq('id', id).eq('doctor_id', userId)
    mutateActive(); mutateConsults()
  }

  async function referConsult(id) {
    await supabase.from('consultations').update({ status: 'referred' }).eq('id', id).eq('doctor_id', userId)
    mutateActive(); mutateConsults()
  }

  const [rxForm, setRxForm]       = useState({ consultation_id: '', medications: '', notes: '', pharmacy_id: '' })
  const [rxError, setRxError]     = useState('')
  const [rxSuccess, setRxSuccess] = useState(false)
  const [rxSaving, setRxSaving]   = useState(false)

  async function handleWriteRx(e) {
    e.preventDefault()
    setRxError(''); setRxSuccess(false); setRxSaving(true)
    const con = active.find(c => c.id === rxForm.consultation_id)
    if (!con) { setRxError(t('doctor.selectActiveConsult')); setRxSaving(false); return }
    const medsArray = rxForm.medications.split('\n')
      .map(l => l.trim()).filter(Boolean).map(l => ({ name: l }))
    const { error } = await supabase.from('prescriptions').insert({
      doctor_id: userId, patient_id: con.patient_id, consultation_id: con.id,
      pharmacy_id: rxForm.pharmacy_id || null, medications: medsArray,
      notes: rxForm.notes.trim() || null, status: 'pending',
    })
    if (error) { setRxError(error.message) } else {
      setRxSuccess(true)
      setRxForm({ consultation_id: '', medications: '', notes: '', pharmacy_id: '' })
      mutateRx()
    }
    setRxSaving(false)
  }

  // Patient timeline
  const timelinePatients = useMemo(() => {
    const { start, end } = dateRange(dateView)
    const inRange = allConsults.filter(c => {
      const d = new Date(c.created_at)
      return d >= start && d <= end
    })
    const seen = new Set()
    return inRange.filter(c => {
      const key = c.patient_id
      if (seen.has(key)) return false
      seen.add(key); return true
    })
  }, [allConsults, dateView])

  // 7-day chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (6 - i))
    const next = new Date(d); next.setDate(next.getDate() + 1)
    return {
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      count: allConsults.filter(c => c.status === 'completed' && new Date(c.created_at) >= d && new Date(c.created_at) < next).length,
    }
  })
  const maxDay = Math.max(...last7.map(d => d.count), 1)

  const completedToday = allConsults.filter(c => c.status === 'completed' && new Date(c.created_at) >= todayStart).length
  const completedAll   = allConsults.filter(c => c.status === 'completed').length

  const inp = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5440]/30`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-2xl font-semibold text-ink">
            {(() => {
              const h = new Date().getHours()
              const key = h < 12 ? 'goodMorning' : h < 17 ? 'goodAfternoon' : 'goodEvening'
              const last = name ? name.split(' ').slice(-1)[0] : ''
              return `${t(key)}${last ? `, ${t('drTitle')} ${last}` : ''}`
            })()}
          </h2>
          <p className="text-sm text-ink/60 mt-0.5">{t('doctor.subtitle')}</p>
        </div>
        {queue.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: '#FFF7E6', color: C.amber }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.amber }} />
            {queue.length} patient{queue.length > 1 ? 's' : ''} waiting
          </div>
        )}
      </div>

      {/* Main tab nav */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'overview',      label: 'Overview' },
          { key: 'patients',      label: 'Patients' },
          { key: 'prescriptions', label: 'Prescriptions' },
          { key: 'schedule',      label: 'Schedule' },
          { key: 'reports',       label: 'Reports' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setMainTab(key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: mainTab === key ? C.deep : C.sand,
              color:      mainTab === key ? '#fff' : C.ink,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {mainTab === 'overview' && (<>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Waiting now"      value={queue.length}   color={C.gold}  sub="in queue" />
          <StatCard label="Active with me"   value={active.length}  color={C.deep}  sub="in consultation" />
          <StatCard label="Rx today"         value={rxToday.length} color={C.green} sub="prescriptions issued" />
          <StatCard label="Completed today"  value={completedToday} color={C.mute}  sub="consultations done" />
        </div>

        {/* 7-day chart */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Consultations completed — last 7 days</h3>
          <div className="flex items-end gap-2 h-24">
            {last7.map(({ label, count }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-ink/50">{count || ''}</span>
                <div className="w-full rounded-t-sm transition-all duration-300"
                  style={{ height: `${Math.max((count / maxDay) * 72, count > 0 ? 4 : 2)}px`, background: count > 0 ? C.deep : C.line }} />
                <span className="text-xs text-ink/40">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Patient queue */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">{t('doctor.patientQueue')}</h3>
            <span className="text-xs text-ink/40">{t('doctor.liveRefresh5s')}</span>
          </div>
          {queue.length === 0 ? (
            <p className="text-sm text-ink/50">{t('doctor.noPatientsWaiting')}</p>
          ) : (
            <div className="space-y-3">
              {queue.map((c, i) => (
                <div key={c.id} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-ivory">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: C.soft, color: C.deep }}>#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{c.users?.full_name ?? c.users?.email ?? 'Patient'}</p>
                    <p className="text-xs text-ink/55 mt-0.5 truncate">{c.reason}</p>
                    <p className="text-xs text-ink/40 mt-1">{c.channel} · {fmtTime(c.created_at)}</p>
                  </div>
                  <button onClick={() => claimConsult(c.id)}
                    className="shrink-0 px-4 py-1.5 rounded-lg text-white text-sm font-medium hover:opacity-90"
                    style={{ background: C.deep }}>
                    {t('doctor.startConsult')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active consultations */}
        {active.length > 0 && (
          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-ink mb-4">{t('doctor.activeConsultations')}</h3>
            <div className="space-y-3">
              {active.map(c => (
                <div key={c.id} className="flex items-start gap-4 p-4 rounded-lg border"
                  style={{ borderColor: `${C.deep}33`, background: C.soft }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{c.users?.full_name ?? c.users?.email ?? 'Patient'}</p>
                    <p className="text-xs text-ink/55 mt-0.5">{c.reason}</p>
                    <p className="text-xs text-ink/40 mt-1">{c.channel} · started {fmtTime(c.updated_at ?? c.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => completeConsult(c.id)}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90"
                      style={{ background: C.green }}>
                      {t('doctor.complete')}
                    </button>
                    <button onClick={() => referConsult(c.id)}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium border hover:opacity-80"
                      style={{ borderColor: C.deep, color: C.deep }}>
                      Refer to clinic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <MyPaySection userId={userId} />
      </>)}

      {/* ── PATIENTS ── */}
      {mainTab === 'patients' && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Patient history</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {DATE_VIEWS.map(v => (
              <button key={v} onClick={() => setDateView(v)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
                style={{
                  background: dateView === v ? C.deep : C.sand,
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
                    {['Patient', 'Reason', 'Channel', 'Status', 'Date'].map(h => (
                      <th key={h} className="pb-2 pr-4 text-xs font-semibold text-ink/50 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timelinePatients.map(c => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-ivory">
                      <td className="py-2.5 pr-4 font-medium text-ink whitespace-nowrap">
                        {c.users?.full_name ?? c.users?.email ?? 'Patient'}
                      </td>
                      <td className="py-2.5 pr-4 text-ink/60 text-xs max-w-[160px] truncate">{c.reason}</td>
                      <td className="py-2.5 pr-4 text-ink/50 text-xs capitalize">{c.channel}</td>
                      <td className="py-2.5 pr-4"><StatusBadge status={c.status} /></td>
                      <td className="py-2.5 text-ink/40 text-xs whitespace-nowrap">{fmtDateTime(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-ink/40 mt-3">{timelinePatients.length} unique patient{timelinePatients.length !== 1 ? 's' : ''} — {DATE_LABELS[dateView].toLowerCase()}</p>
            </div>
          )}
        </section>
      )}

      {/* ── PRESCRIPTIONS ── */}
      {mainTab === 'prescriptions' && (<>
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-1">{t('doctor.writeRx')}</h3>
          <p className="text-sm text-ink/55 mb-4">{t('doctor.writeRxDesc')}</p>
          {rxError   && <Alert type="error"   msg={rxError} />}
          {rxSuccess && <Alert type="success" msg={t('doctor.rxCreated')} />}
          <form onSubmit={handleWriteRx} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">{t('doctor.activeConsultLabel')}</label>
              <select required value={rxForm.consultation_id}
                onChange={e => setRxForm(f => ({ ...f, consultation_id: e.target.value }))}
                className={inp}>
                <option value="">{t('doctor.selectPatient')}</option>
                {active.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.users?.full_name ?? 'Patient'} · {c.channel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                {t('doctor.medicationsLabel')} <span className="text-ink/40 font-normal">{t('doctor.medicationsHint')}</span>
              </label>
              <textarea required rows={4} value={rxForm.medications}
                onChange={e => setRxForm(f => ({ ...f, medications: e.target.value }))}
                className={`${inp} resize-none`}
                placeholder={"Amoxicillin 500mg 3×/day 7 days\nParacetamol 1g as needed"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">{t('doctor.notesLabel')}</label>
              <input type="text" value={rxForm.notes}
                onChange={e => setRxForm(f => ({ ...f, notes: e.target.value }))}
                className={inp} placeholder={t('doctor.notesPlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">{t('doctor.sendToPharmacy')}</label>
              <select value={rxForm.pharmacy_id}
                onChange={e => setRxForm(f => ({ ...f, pharmacy_id: e.target.value }))}
                className={inp}>
                <option value="">{t('doctor.patientChoosesPharmacy')}</option>
                {pharmacies.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={rxSaving}
              className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50"
              style={{ background: C.deep }}>
              {rxSaving ? t('patient.sending') : t('doctor.sendPrescription')}
            </button>
          </form>
        </section>

        {/* Rx history */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4">Prescription history</h3>
          {allRx.length === 0 ? (
            <p className="text-sm text-ink/50">No prescriptions issued yet.</p>
          ) : (
            <div className="space-y-3">
              {allRx.slice(0, 20).map(rx => (
                <div key={rx.id} className="p-4 rounded-lg border border-border bg-ivory">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={rx.status} />
                        <span className="text-xs text-ink/40">{fmtDateTime(rx.created_at)}</span>
                      </div>
                      <p className="text-sm font-medium text-ink">{rx.users?.full_name ?? rx.users?.email ?? 'Patient'}</p>
                      <p className="text-xs text-ink/60 mt-1">{formatMeds(rx.medications)}</p>
                      {rx.notes && <p className="text-xs text-ink/40 mt-0.5 italic">{rx.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>)}

      {/* ── SCHEDULE ── */}
      {mainTab === 'schedule' && (
        <AppointmentsSection doctorId={userId} />
      )}

      {/* ── REPORTS ── */}
      {mainTab === 'reports' && (<>
        <ClinicReportsSection doctorId={userId} />
        <WhatsAppTriageSection doctorId={userId} />
      </>)}
    </div>
  )
}

function formatMeds(meds) {
  if (!meds) return '—'
  if (Array.isArray(meds)) return meds.map(m => m.name ?? m).join(' · ')
  if (typeof meds === 'string') return meds
  return JSON.stringify(meds)
}

function fmtTime(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ago`
}

function fmtDateTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
