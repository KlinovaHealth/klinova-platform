'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, Alert, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'

const C = '#CF5A3C'

const emptyBook = { patientId: '', reason: '', channel: 'chat' }

export default function FrontdeskDashboard({ userId, name }) {
  const supabase = createClient()
  const { t } = useLanguage()
  const today = new Date().toISOString().slice(0, 10)

  const { data: totalPatients = 0 } = useSWR('frontdesk-total-patients', async () => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient')
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: todayConsults = 0 } = useSWR('frontdesk-today-consults', async () => {
    const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', today)
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: waitingNow = 0 } = useSWR('frontdesk-waiting-now', async () => {
    const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('status', 'waiting')
    return count ?? 0
  }, { refreshInterval: 15000 })

  const { data: patients = [] } = useSWR('frontdesk-patients', async () => {
    const { data } = await supabase.from('users')
      .select('id, full_name, email, created_at').eq('role', 'patient')
      .order('created_at', { ascending: false }).limit(50)
    return data ?? []
  }, { refreshInterval: 30000 })

  const [search, setSearch] = useState('')
  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return (p.full_name ?? '').toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q)
  })

  const [form, setForm] = useState(emptyBook)
  const [booking, setBooking] = useState(false)
  const [bookError, setBookError]     = useState('')
  const [bookSuccess, setBookSuccess] = useState(false)

  async function handleBook(e) {
    e.preventDefault()
    setBooking(true); setBookError(''); setBookSuccess(false)
    const { error } = await supabase.from('consultations').insert({
      patient_id: form.patientId, reason: form.reason, channel: form.channel, status: 'waiting',
    })
    if (error) { setBookError(error.message) } else {
      setBookSuccess(true); setForm(emptyBook)
    }
    setBooking(false)
  }

  const inputCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#CF5A3C] focus:border-[#CF5A3C]`

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{getGreeting(name, t)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">{t('frontdesk.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('frontdesk.stats.totalPatients')} value={totalPatients} color={C} sub={t('frontdesk.stats.totalPatientsSub')} />
        <StatCard label={t('frontdesk.stats.todayConsults')} value={todayConsults} color={C} sub={t('frontdesk.stats.todayConsultsSub')} />
        <StatCard label={t('frontdesk.stats.waitingNow')}    value={waitingNow}    color={C} sub={t('frontdesk.stats.waitingNowSub')} />
      </div>

      <section id="patients" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-3">{t('frontdesk.patientLookup')}</h3>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('frontdesk.searchPlaceholder')}
          className={inputCls + ' mb-4'}
        />
        {filtered.length === 0 ? (
          <p className="text-sm text-ink/50">{search ? t('frontdesk.noMatch') : t('frontdesk.noPatients')}</p>
        ) : (
          <Table
            cols={[t('col.name'), t('col.email'), t('col.joined')]}
            rows={filtered.map(p => [
              p.full_name ?? '—',
              p.email ?? '—',
              fmtDate(p.created_at),
            ])}
          />
        )}
      </section>

      <section id="book" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">{t('frontdesk.bookConsult')}</h3>
        <p className="text-sm text-ink/55 mb-4">{t('frontdesk.bookConsultDesc')}</p>

        {bookError   && <Alert type="error"   msg={bookError} />}
        {bookSuccess && <Alert type="success" msg={t('frontdesk.bookSuccess')} />}

        <form onSubmit={handleBook} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BField label={t('frontdesk.form.patientId')} required>
            <input type="text" required value={form.patientId}
              onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
              className={inputCls} placeholder={t('frontdesk.form.patientIdPlaceholder')} />
          </BField>
          <BField label={t('frontdesk.form.channel')} required>
            <select required value={form.channel}
              onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
              className={inputCls}>
              {['chat', 'video', 'audio'].map(ch => (
                <option key={ch} value={ch}>{t(`channels.${ch}`)}</option>
              ))}
            </select>
          </BField>
          <BField label={t('frontdesk.form.reason')} required className="sm:col-span-2">
            <input type="text" required value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className={inputCls} placeholder={t('frontdesk.form.reasonPlaceholder')} />
          </BField>
          <div className="sm:col-span-2">
            <button type="submit" disabled={booking}
              className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm
                         hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
              style={{ background: C }}>
              {booking ? t('frontdesk.booking') : t('frontdesk.bookBtn')}
            </button>
          </div>
        </form>
      </section>

      <MyPaySection userId={userId} />
    </div>
  )
}

function BField({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink mb-1">
        {label}{required && <span className="text-[#CF5A3C] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}
