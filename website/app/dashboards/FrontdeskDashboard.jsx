'use client'
import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, Alert, getGreeting, StatusBadge } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'
import AppointmentsSection from './AppointmentsSection'

const C = {
  gold:   '#D99A2B',
  green:  '#0E6B4F',
  deep:   '#0A5440',
  coral:  '#CF5A3C',
  amber:  '#E0A23B',
  ink:    '#15302A',
  soft:   '#E3EFE8',
  ivory:  '#F5EFE3',
  sand:   '#EDE4D2',
  line:   '#E7DECC',
  mute:   '#6E7F76',
}

const emptyBook = { patientId: '', reason: '', channel: 'chat' }

export default function FrontdeskDashboard({ userId, name, clinicId }) {
  const supabase = createClient()
  const { t } = useLanguage()
  const today = new Date().toISOString().slice(0, 10)
  const [mainTab, setMainTab] = useState('overview')

  const { data: totalPatients = 0 } = useSWR('frontdesk-total-patients', async () => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient')
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: todayConsults = 0, mutate: mutateToday } = useSWR('frontdesk-today-consults', async () => {
    const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', today)
    return count ?? 0
  }, { refreshInterval: 15000 })

  const { data: waitingNow = 0 } = useSWR('frontdesk-waiting-now', async () => {
    const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('status', 'waiting')
    return count ?? 0
  }, { refreshInterval: 10000 })

  const { data: patients = [] } = useSWR('frontdesk-patients', async () => {
    const { data } = await supabase.from('users')
      .select('id, full_name, email, created_at').eq('role', 'patient')
      .order('created_at', { ascending: false }).limit(100)
    return data ?? []
  }, { refreshInterval: 30000 })

  const { data: recentConsults = [] } = useSWR('frontdesk-recent-consults', async () => {
    const { data } = await supabase.from('consultations')
      .select('*, users!patient_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50)
    return data ?? []
  }, { refreshInterval: 15000 })

  const { data: pendingReferrals = [], mutate: mutatePendingRef } = useSWR('frontdesk-overview-refs', async () => {
    const { data } = await supabase.from('consultations')
      .select('*, users!patient_id(full_name, email)')
      .eq('status', 'referred')
      .order('created_at', { ascending: false })
      .limit(10)
    return data ?? []
  }, { refreshInterval: 12000 })

  const tStart = new Date(); tStart.setHours(0, 0, 0, 0)
  const tEnd   = new Date(); tEnd.setHours(23, 59, 59, 999)
  const { data: todayAppts = [] } = useSWR('frontdesk-today-appts', async () => {
    const { data } = await supabase.from('appointments')
      .select('id, scheduled_at, patient_name, reason, status')
      .gte('scheduled_at', tStart.toISOString())
      .lte('scheduled_at', tEnd.toISOString())
      .order('scheduled_at', { ascending: true })
    return data ?? []
  }, { refreshInterval: 30000 })

  const { data: rxCount30 = 0 } = useSWR('frontdesk-rx-30d', async () => {
    const since = new Date(); since.setDate(since.getDate() - 30)
    const { count } = await supabase.from('prescriptions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString())
    return count ?? 0
  }, { refreshInterval: 60000 })

  // 7-day chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (6 - i))
    const next = new Date(d); next.setDate(next.getDate() + 1)
    return {
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      count: recentConsults.filter(c => new Date(c.created_at) >= d && new Date(c.created_at) < next).length,
    }
  })
  const maxDay = Math.max(...last7.map(d => d.count), 1)

  const [search, setSearch] = useState('')
  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return (p.full_name ?? '').toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q)
  })

  const [form, setForm] = useState(emptyBook)
  const [booking, setBooking] = useState(false)
  const [bookError, setBookError]     = useState('')
  const [bookSuccess, setBookSuccess] = useState(false)

  async function acceptRef(id) {
    await supabase.from('consultations').update({ status: 'waiting' }).eq('id', id)
    mutatePendingRef(); mutateToday()
  }

  async function declineRef(id) {
    await supabase.from('consultations').update({ status: 'cancelled' }).eq('id', id)
    mutatePendingRef()
  }

  async function handleBook(e) {
    e.preventDefault()
    setBooking(true); setBookError(''); setBookSuccess(false)
    const { error } = await supabase.from('consultations').insert({
      patient_id: form.patientId, reason: form.reason, channel: form.channel, status: 'waiting',
    })
    if (error) { setBookError(error.message) } else {
      setBookSuccess(true); setForm(emptyBook); mutateToday()
    }
    setBooking(false)
  }

  const inp = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
               focus:outline-none focus:ring-2 focus:ring-[#CF5A3C] focus:border-[#CF5A3C]`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-2xl font-semibold text-ink">
            {getGreeting(name, t)}
          </h2>
          <p className="text-sm text-ink/60 mt-0.5">{t('frontdesk.subtitle')}</p>
        </div>
        {waitingNow > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: '#FFF7E6', color: C.amber }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.amber }} />
            {waitingNow} patient{waitingNow > 1 ? 's' : ''} waiting
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'overview',     label: 'Overview' },
          { key: 'patients',     label: 'Patients' },
          { key: 'schedule',     label: 'Schedule' },
          { key: 'referrals',    label: 'Referrals' },
          { key: 'billing',      label: 'Billing' },
          { key: 'reports',      label: 'Reports' },
          { key: 'listing',      label: 'Your Listing' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setMainTab(key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: mainTab === key ? C.coral : C.sand,
              color:      mainTab === key ? '#fff' : C.ink,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {mainTab === 'overview' && (<>

        {/* 4 KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Appointments today"  value={todayAppts.length}         color={C.green} sub={`${todayAppts.filter(a => a.status === 'completed').length} completed`} />
          <StatCard label="Pending referrals"   value={pendingReferrals.length}   color={pendingReferrals.length > 0 ? C.coral : C.mute} sub="from Klinova doctors" />
          <StatCard label="Prescriptions (30d)" value={rxCount30}                 color={C.gold}  sub="issued this month" />
          <StatCard label="Consults today"      value={todayConsults}             color={C.amber} sub="walk-ins and teleconsults" />
        </div>

        {/* Today's schedule + referrals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink">Today's schedule</h3>
              <button onClick={() => setMainTab('schedule')}
                className="text-xs font-semibold hover:underline" style={{ color: C.green }}>
                Full schedule →
              </button>
            </div>
            {todayAppts.length === 0 ? (
              <p className="text-sm text-ink/50">No appointments scheduled for today.</p>
            ) : (
              <div className="divide-y divide-border">
                {todayAppts.slice(0, 6).map(a => (
                  <div key={a.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-xs font-bold w-10 text-right shrink-0" style={{ color: C.green }}>
                      {new Date(a.scheduled_at).toTimeString().slice(0, 5)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{a.patient_name}</p>
                      <p className="text-xs text-ink/50 truncate">{a.reason}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium" style={{
                      background: a.status === 'completed' ? C.soft   : a.status === 'cancelled' ? '#FFF0ED' : '#FFF7E6',
                      color:      a.status === 'completed' ? C.green  : a.status === 'cancelled' ? C.coral   : C.amber,
                    }}>{a.status}</span>
                  </div>
                ))}
                {todayAppts.length > 6 && (
                  <p className="text-xs text-ink/40 pt-2">+{todayAppts.length - 6} more</p>
                )}
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink">Referrals</h3>
              {pendingReferrals.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: C.coral }}>
                  {pendingReferrals.length} pending
                </span>
              )}
            </div>
            {pendingReferrals.length === 0 ? (
              <p className="text-sm text-ink/50">No pending referrals from Klinova doctors.</p>
            ) : (
              <div className="space-y-2">
                {pendingReferrals.slice(0, 4).map(r => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-ivory">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{r.users?.full_name ?? r.users?.email ?? 'Patient'}</p>
                      <p className="text-xs text-ink/55 mt-0.5 truncate">{r.reason}</p>
                      <p className="text-xs text-ink/40 mt-1">{fmtTime(r.created_at)}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => acceptRef(r.id)}
                        className="px-3 py-1 rounded-lg text-white text-xs font-semibold hover:opacity-90"
                        style={{ background: C.green }}>Accept</button>
                      <button onClick={() => declineRef(r.id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold border hover:opacity-80"
                        style={{ borderColor: C.coral, color: C.coral }}>Decline</button>
                    </div>
                  </div>
                ))}
                {pendingReferrals.length > 4 && (
                  <button onClick={() => setMainTab('referrals')}
                    className="text-xs font-semibold hover:underline mt-1" style={{ color: C.coral }}>
                    View all {pendingReferrals.length} in Referrals tab →
                  </button>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Live queue + 7-day chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink">Live queue</h3>
              <span className="text-xs text-ink/40">Auto-refreshing</span>
            </div>
            {recentConsults.filter(c => c.status === 'waiting').length === 0 ? (
              <p className="text-sm text-ink/50">No patients currently waiting.</p>
            ) : (
              <div className="space-y-2">
                {recentConsults.filter(c => c.status === 'waiting').map((c, i) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-ivory">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: C.soft, color: C.coral }}>#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{c.users?.full_name ?? c.users?.email ?? 'Patient'}</p>
                      <p className="text-xs text-ink/55 truncate">{c.reason}</p>
                      <p className="text-xs text-ink/40">{c.channel} · {fmtTime(c.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-ink mb-4">Consultations, last 7 days</h3>
            <div className="flex items-end gap-2 h-24">
              {last7.map(({ label, count }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-ink/50">{count || ''}</span>
                  <div className="w-full rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.max((count / maxDay) * 72, count > 0 ? 4 : 2)}px`, background: count > 0 ? C.coral : C.line }} />
                  <span className="text-xs text-ink/40">{label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <MyPaySection userId={userId} />
      </>)}

      {/* ── PATIENTS ── */}
      {mainTab === 'patients' && (
        <div className="space-y-5">
          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-ink mb-3">{t('frontdesk.patientLookup')}</h3>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('frontdesk.searchPlaceholder')}
              className={`${inp} mb-4`} />
            {filtered.length === 0 ? (
              <p className="text-sm text-ink/50">{search ? t('frontdesk.noMatch') : t('frontdesk.noPatients')}</p>
            ) : (
              <Table
                cols={[t('col.name'), t('col.email'), t('col.joined')]}
                rows={filtered.map(p => [p.full_name ?? '—', p.email ?? '—', fmtDate(p.created_at)])}
              />
            )}
          </section>

          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-ink mb-1">{t('frontdesk.bookConsult')}</h3>
            <p className="text-sm text-ink/55 mb-4">{t('frontdesk.bookConsultDesc')}</p>
            {bookError   && <Alert type="error"   msg={bookError} />}
            {bookSuccess && <Alert type="success" msg={t('frontdesk.bookSuccess')} />}
            <form onSubmit={handleBook} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BField label={t('frontdesk.form.patientId')} required>
                <input type="text" required value={form.patientId}
                  onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                  className={inp} placeholder={t('frontdesk.form.patientIdPlaceholder')} />
              </BField>
              <BField label={t('frontdesk.form.channel')} required>
                <select required value={form.channel}
                  onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                  className={inp}>
                  {['chat', 'video', 'audio'].map(ch => (
                    <option key={ch} value={ch}>{t(`channels.${ch}`)}</option>
                  ))}
                </select>
              </BField>
              <BField label={t('frontdesk.form.reason')} required className="sm:col-span-2">
                <input type="text" required value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  className={inp} placeholder={t('frontdesk.form.reasonPlaceholder')} />
              </BField>
              <div className="sm:col-span-2">
                <button type="submit" disabled={booking}
                  className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                  style={{ background: C.coral }}>
                  {booking ? t('frontdesk.booking') : t('frontdesk.bookBtn')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ── SCHEDULE ── */}
      {mainTab === 'schedule' && (
        <AppointmentsSection doctorId={userId} />
      )}

      {/* ── REFERRALS ── */}
      {mainTab === 'referrals' && (
        <ReferralSection supabase={supabase} />
      )}

      {/* ── BILLING ── */}
      {mainTab === 'billing' && (
        <BillingSection supabase={supabase} todayConsults={todayConsults} />
      )}

      {/* ── REPORTS ── */}
      {mainTab === 'reports' && (
        <ClinicReportsTab supabase={supabase} />
      )}

      {/* ── LISTING ── */}
      {mainTab === 'listing' && (
        <GetListedSection supabase={supabase} userId={userId} clinicId={clinicId} />
      )}
    </div>
  )
}

function ReferralSection({ supabase }) {
  const { data: referrals = [], mutate } = useSWR('frontdesk-referrals', async () => {
    const { data } = await supabase
      .from('consultations')
      .select('*, users!patient_id(full_name, email)')
      .eq('status', 'referred')
      .order('created_at', { ascending: false })
      .limit(30)
    return data ?? []
  }, { refreshInterval: 12000 })

  async function acceptReferral(id) {
    await supabase.from('consultations').update({ status: 'waiting' }).eq('id', id)
    mutate()
  }

  async function declineReferral(id) {
    await supabase.from('consultations').update({ status: 'cancelled' }).eq('id', id)
    mutate()
  }

  return (
    <section className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink">Incoming referrals</h3>
        {referrals.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: C.coral }}>
            {referrals.length}
          </span>
        )}
      </div>
      {referrals.length === 0 ? (
        <p className="text-sm text-ink/50">No pending referrals from Klinova doctors.</p>
      ) : (
        <div className="space-y-3">
          {referrals.map(r => (
            <div key={r.id} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-ivory">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{r.users?.full_name ?? r.users?.email ?? 'Patient'}</p>
                <p className="text-xs text-ink/55 mt-0.5 truncate">{r.reason}</p>
                <p className="text-xs text-ink/40 mt-1">{fmtDate(r.created_at)}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => acceptReferral(r.id)}
                  className="px-4 py-1.5 rounded-lg text-white text-sm font-medium hover:opacity-90"
                  style={{ background: C.green }}>
                  Accept
                </button>
                <button onClick={() => declineReferral(r.id)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium border hover:opacity-80"
                  style={{ borderColor: C.coral, color: C.coral }}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function BillingSection({ supabase, todayConsults }) {
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0)
  const statusColor = { paid: C.green, pending: C.amber, overdue: C.coral }

  const { data: monthConsults = 0 } = useSWR('frontdesk-month-consults', async () => {
    const { count } = await supabase.from('consultations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonth.toISOString()).eq('status', 'completed')
    return count ?? 0
  }, { refreshInterval: 60000 })

  const { data: invoices = [] } = useSWR('frontdesk-invoices', async () => {
    const { data } = await supabase.from('clinic_invoices')
      .select('*').order('created_at', { ascending: false }).limit(6)
    return data ?? []
  }, { refreshInterval: 60000 })

  return (
    <section className="bg-white rounded-xl border border-border shadow-card p-5">
      <h3 className="font-semibold text-ink mb-4">Billing & subscription</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-ivory rounded-lg p-4 border border-border">
          <p className="text-xs text-ink/50 uppercase tracking-wide font-semibold mb-1">This month</p>
          <p className="text-2xl font-bold" style={{ color: C.coral }}>{monthConsults}</p>
          <p className="text-xs text-ink/50">completed consultations</p>
        </div>
        <div className="bg-ivory rounded-lg p-4 border border-border">
          <p className="text-xs text-ink/50 uppercase tracking-wide font-semibold mb-1">Today</p>
          <p className="text-2xl font-bold text-ink">{todayConsults}</p>
          <p className="text-xs text-ink/50">total consultations</p>
        </div>
      </div>
      {invoices.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">Invoice history</p>
          {invoices.map(inv => (
            <div key={inv.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-border hover:bg-ivory">
              <div>
                <p className="text-sm font-medium text-ink">{inv.period ?? fmtDate(inv.created_at)}</p>
                <p className="text-xs text-ink/50">{inv.amount?.toLocaleString()} {inv.currency ?? 'XOF'}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{ background: `${statusColor[inv.status] ?? C.mute}22`, color: statusColor[inv.status] ?? C.mute }}>
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/50">
          No invoices yet. Contact <a href="mailto:billing@klinova.co" className="hover:underline" style={{ color: C.green }}>billing@klinova.co</a> to set up your subscription.
        </p>
      )}
    </section>
  )
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
const SERVICES = [
  'General medicine', 'Pediatrics', 'Maternity / OB-GYN', 'Emergency care',
  'Surgery', 'Dentistry', 'Ophthalmology', 'Mental health',
  'Laboratory', 'Imaging / Radiology', 'Pharmacy on-site', 'Vaccination',
]

function GetListedSection({ supabase, userId, clinicId }) {
  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '', website: '',
    services: [], accepting_patients: true,
    hours: Object.fromEntries(DAYS.map(d => [d, { open: true, from: '08:00', to: '18:00' }])),
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
    const payload = {
      user_id: userId,
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      services: form.services,
      accepting_patients: form.accepting_patients,
      hours: form.hours,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      notes: form.notes.trim() || null,
      listed: true,
      updated_at: new Date().toISOString(),
    }
    const { error } = clinicId
      ? await supabase.from('clinics').update(payload).eq('id', clinicId)
      : await supabase.from('clinics').upsert(payload, { onConflict: 'user_id' })
    setMsg(error ? `Error: ${error.message}` : 'Listing saved. Klinova will review and publish your listing within 24 hours.')
    setSaving(false)
  }

  const inp = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
               focus:outline-none focus:ring-2 focus:ring-[#D99A2B] focus:border-[#D99A2B]`

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-xl p-6 border" style={{ background: C.soft, borderColor: `${C.green}30` }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: C.green }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-ink text-lg mb-1">Your listing is live</h3>
            <p className="text-sm text-ink/70 leading-relaxed">
              Your facility is already listed in the Klinova provider directory, searchable by patients nearby.
              Complete the details below to appear higher in results and show your hours, services, and location pin.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic info */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h4 className="font-semibold text-ink mb-4">Facility information</h4>
          {msg && (
            <p className="text-sm mb-4 px-3 py-2 rounded-lg"
              style={{ background: msg.startsWith('Error') ? '#FFF0ED' : C.soft, color: msg.startsWith('Error') ? C.coral : C.green }}>
              {msg}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink mb-1">Facility name <span style={{ color: C.coral }}>*</span></label>
              <input required type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inp} placeholder="Clinic du Centre, Lomé" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink mb-1">Full address <span style={{ color: C.coral }}>*</span></label>
              <input required type="text" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className={inp} placeholder="123 Rue du Commerce, Lomé, Togo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Phone</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className={inp} placeholder="+228 90 00 00 00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={inp} placeholder="contact@clinic.tg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Website</label>
              <input type="url" value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                className={inp} placeholder="https://clinic.tg" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.accepting_patients}
                  onChange={e => setForm(f => ({ ...f, accepting_patients: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-ink">Currently accepting new patients</span>
              </label>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h4 className="font-semibold text-ink mb-3">Services offered</h4>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <button key={s} type="button" onClick={() => toggleService(s)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                style={{
                  background: form.services.includes(s) ? C.green : C.ivory,
                  color:      form.services.includes(s) ? '#fff' : C.ink,
                  borderColor: form.services.includes(s) ? C.green : C.line,
                }}>
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Hours */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h4 className="font-semibold text-ink mb-4">Opening hours</h4>
          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-3 flex-wrap">
                <div className="w-24">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.hours[day].open}
                      onChange={e => setForm(f => ({
                        ...f, hours: { ...f.hours, [day]: { ...f.hours[day], open: e.target.checked } }
                      }))}
                      className="w-4 h-4 rounded" />
                    <span className="text-sm text-ink">{day.slice(0, 3)}</span>
                  </label>
                </div>
                {form.hours[day].open ? (<>
                  <select value={form.hours[day].from}
                    onChange={e => setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], from: e.target.value } } }))}
                    className="px-2 py-1.5 rounded-lg border border-border bg-ivory text-ink text-sm focus:outline-none">
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-xs text-ink/40">to</span>
                  <select value={form.hours[day].to}
                    onChange={e => setForm(f => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], to: e.target.value } } }))}
                    className="px-2 py-1.5 rounded-lg border border-border bg-ivory text-ink text-sm focus:outline-none">
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </>) : (
                  <span className="text-sm text-ink/40">Closed</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Optional map pin */}
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h4 className="font-semibold text-ink mb-1">Map coordinates <span className="text-xs font-normal text-ink/40">(optional — helps with pin accuracy)</span></h4>
          <p className="text-xs text-ink/50 mb-4">Find your coordinates on Google Maps by right-clicking your location and copying the numbers.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Latitude</label>
              <input type="number" step="any" value={form.lat}
                onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                className={inp} placeholder="6.1375" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Longitude</label>
              <input type="number" step="any" value={form.lng}
                onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                className={inp} placeholder="1.2123" />
            </div>
          </div>
        </section>

        <div>
          <label className="block text-xs font-medium text-ink mb-1">Additional notes for patients</label>
          <textarea rows={3} value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className={`${inp} resize-none`}
            placeholder="Parking available, wheelchair accessible, WhatsApp booking at +228 90..." />
        </div>

        <button type="submit" disabled={saving}
          className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50"
          style={{ background: C.green }}>
          {saving ? 'Saving…' : 'Submit listing'}
        </button>
      </form>
    </div>
  )
}

function ClinicReportsTab({ supabase }) {
  const [period, setPeriod] = useState('30d')
  const PERIODS = [{ key: '7d', label: '7 days' }, { key: '30d', label: '30 days' }, { key: '90d', label: '3 months' }]

  function periodStart(key) {
    const d = new Date()
    if (key === '7d')  d.setDate(d.getDate() - 7)
    if (key === '30d') d.setDate(d.getDate() - 30)
    if (key === '90d') d.setDate(d.getDate() - 90)
    return d.toISOString()
  }

  const { data: consults = [] } = useSWR(`clinic-reports-consults-${period}`, async () => {
    const { data } = await supabase.from('consultations')
      .select('id, status, channel, created_at')
      .gte('created_at', periodStart(period))
      .order('created_at', { ascending: false })
    return data ?? []
  }, { refreshInterval: 60000 })

  const { data: rxCount = 0 } = useSWR(`clinic-reports-rx-${period}`, async () => {
    const { count } = await supabase.from('prescriptions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', periodStart(period))
    return count ?? 0
  }, { refreshInterval: 60000 })

  const { data: referrals = [] } = useSWR(`clinic-reports-referrals-${period}`, async () => {
    const { data } = await supabase.from('consultations')
      .select('id, status, created_at')
      .eq('status', 'referred')
      .gte('created_at', periodStart(period))
    return data ?? []
  }, { refreshInterval: 60000 })

  const completed  = consults.filter(c => c.status === 'completed').length
  const pending    = consults.filter(c => c.status === 'waiting').length
  const byChannel  = consults.reduce((acc, c) => { acc[c.channel] = (acc[c.channel] ?? 0) + 1; return acc }, {})

  // Daily breakdown for bar chart (last 14 days)
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (13 - i))
    const next = new Date(d); next.setDate(next.getDate() + 1)
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      count: consults.filter(c => new Date(c.created_at) >= d && new Date(c.created_at) < next).length,
    }
  })
  const maxDay = Math.max(...days14.map(d => d.count), 1)

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: period === p.key ? C.coral : C.sand, color: period === p.key ? '#fff' : C.ink }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Consultations</p>
          <p className="text-3xl font-bold" style={{ color: C.coral }}>{consults.length}</p>
          <p className="text-xs text-ink/40 mt-1">in {period === '7d' ? '7 days' : period === '30d' ? '30 days' : '3 months'}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Completed</p>
          <p className="text-3xl font-bold" style={{ color: C.green }}>{completed}</p>
          <p className="text-xs text-ink/40 mt-1">{consults.length ? Math.round((completed / consults.length) * 100) : 0}% completion rate</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Prescriptions</p>
          <p className="text-3xl font-bold" style={{ color: C.gold }}>{rxCount}</p>
          <p className="text-xs text-ink/40 mt-1">issued this period</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Referrals in</p>
          <p className="text-3xl font-bold" style={{ color: C.amber }}>{referrals.length}</p>
          <p className="text-xs text-ink/40 mt-1">from Klinova doctors</p>
        </div>
      </div>

      {/* Daily chart */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Daily consultations — last 14 days</h3>
        <div className="flex items-end gap-1 h-24">
          {days14.map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-ink/40" style={{ fontSize: 9 }}>{count || ''}</span>
              <div className="w-full rounded-t-sm"
                style={{ height: `${Math.max((count / maxDay) * 68, count > 0 ? 3 : 1)}px`, background: count > 0 ? C.coral : C.line }} />
              <span className="text-ink/30" style={{ fontSize: 8 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Channel breakdown */}
      <section className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Consultation channels</h3>
        <div className="flex gap-4 flex-wrap">
          {Object.entries(byChannel).map(([ch, count]) => (
            <div key={ch} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border">
              <span className="capitalize text-sm font-medium text-ink">{ch}</span>
              <span className="text-sm font-bold" style={{ color: C.coral }}>{count}</span>
            </div>
          ))}
          {Object.keys(byChannel).length === 0 && <p className="text-sm text-ink/50">No data yet.</p>}
        </div>
      </section>

      {/* Upcoming appointments quick view */}
      <UpcomingAppointmentsWidget supabase={supabase} />
    </div>
  )
}

function UpcomingAppointmentsWidget({ supabase }) {
  const now = new Date().toISOString()
  const { data: upcoming = [] } = useSWR('clinic-upcoming-appts', async () => {
    const { data } = await supabase.from('appointments')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(10)
    return data ?? []
  }, { refreshInterval: 60000 })

  const { data: past = [] } = useSWR('clinic-past-appts', async () => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14)
    const { data } = await supabase.from('appointments')
      .select('*')
      .lt('scheduled_at', now)
      .gte('scheduled_at', cutoff.toISOString())
      .order('scheduled_at', { ascending: false })
      .limit(10)
    return data ?? []
  }, { refreshInterval: 60000 })

  const [view, setView] = useState('upcoming')

  return (
    <section className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink">Appointments</h3>
        <div className="flex gap-1">
          {['upcoming', 'past'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors"
              style={{ background: view === v ? C.coral : C.sand, color: view === v ? '#fff' : C.mute }}>
              {v}
            </button>
          ))}
        </div>
      </div>
      {(view === 'upcoming' ? upcoming : past).length === 0 ? (
        <p className="text-sm text-ink/50">No {view} appointments.</p>
      ) : (
        <div className="space-y-2">
          {(view === 'upcoming' ? upcoming : past).map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-ivory">
              <div className="text-sm font-bold shrink-0 min-w-[44px] text-center"
                style={{ color: view === 'upcoming' ? C.green : C.mute }}>
                {new Date(a.scheduled_at).toTimeString().slice(0, 5)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{a.patient_name}</p>
                <p className="text-xs text-ink/50">{a.reason}</p>
              </div>
              <span className="text-xs text-ink/40 shrink-0">{fmtDate(a.scheduled_at)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function BField({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink mb-1">
        {label}{required && <span style={{ color: C.coral }} className="ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTime(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ago`
}
