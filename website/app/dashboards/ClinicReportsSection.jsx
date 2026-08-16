'use client'
import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'

const C = '#0A5440'

const PERIODS = [
  { key: '7d',  labelEn: '7 days',  labelFr: '7 jours'  },
  { key: '30d', labelEn: '30 days', labelFr: '30 jours' },
  { key: '90d', labelEn: '3 months',labelFr: '3 mois'   },
]

function startOf(key) {
  const d = new Date()
  if (key === '7d')  d.setDate(d.getDate() - 7)
  if (key === '30d') d.setDate(d.getDate() - 30)
  if (key === '90d') d.setDate(d.getDate() - 90)
  return d.toISOString()
}

function fmtCurrency(n, currency = 'XOF') {
  return n.toLocaleString('fr-FR') + ' ' + currency
}

// Simple bar chart using divs — no external dependency
function MiniBar({ data, color, valueKey, labelKey, height = 80 }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, paddingTop: 4 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ fontSize: 9, color: '#999', fontWeight: 600 }}>{d[valueKey] || ''}</div>
          <div style={{ width: '100%', background: color, borderRadius: '3px 3px 0 0', opacity: 0.85,
            height: `${Math.max((d[valueKey] / max) * (height - 20), d[valueKey] > 0 ? 4 : 0)}px`,
            transition: 'height .3s ease' }} />
          <div style={{ fontSize: 9, color: '#AAA', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textAlign: 'center' }}>
            {d[labelKey]}
          </div>
        </div>
      ))}
    </div>
  )
}

function KPI({ label, value, sub, color }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E5DDD0', borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#AAA', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? C, letterSpacing: '-.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function ClinicReportsSection({ doctorId }) {
  const supabase = createClient()
  const { lang } = useLanguage()
  const [period, setPeriod] = useState('30d')
  const from = startOf(period)

  const { data: consults = [] } = useSWR(
    `reports-consults-${doctorId}-${period}`,
    async () => {
      const { data } = await supabase
        .from('consultations')
        .select('id, status, created_at, channel')
        .eq('doctor_id', doctorId)
        .gte('created_at', from)
        .order('created_at', { ascending: true })
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  const { data: rxList = [] } = useSWR(
    `reports-rx-${doctorId}-${period}`,
    async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select('id, status, created_at')
        .eq('doctor_id', doctorId)
        .gte('created_at', from)
        .order('created_at', { ascending: true })
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  const { data: appts = [] } = useSWR(
    `reports-appts-${doctorId}-${period}`,
    async () => {
      const { data } = await supabase
        .from('appointments')
        .select('id, status, scheduled_at')
        .eq('doctor_id', doctorId)
        .gte('scheduled_at', from)
        .order('scheduled_at', { ascending: true })
      return data ?? []
    },
    { refreshInterval: 60000 }
  )

  // KPIs
  const completedConsults  = consults.filter(c => c.status === 'completed').length
  const pendingConsults    = consults.filter(c => ['waiting','active'].includes(c.status)).length
  const rxFulfilled        = rxList.filter(r => r.status === 'fulfilled').length
  const apptCompleted      = appts.filter(a => a.status === 'completed').length
  const apptCancelled      = appts.filter(a => a.status === 'cancelled').length
  const apptCompletionRate = appts.length ? Math.round((apptCompleted / appts.length) * 100) : 0

  // Estimated revenue: $27 per completed consultation (standard fee after 10% discount)
  const estRevenue = completedConsults * 27

  // Build daily chart buckets (last N days)
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const chartData = useMemo(() => {
    const buckets = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = days <= 7
        ? d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short' })
        : days <= 30
          ? d.getDate().toString()
          : d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short', day: 'numeric' })
      buckets.push({ date: key, label, consults: 0, rx: 0 })
    }
    consults.forEach(c => {
      const key = c.created_at?.slice(0, 10)
      const b = buckets.find(b => b.date === key)
      if (b) b.consults++
    })
    rxList.forEach(r => {
      const key = r.created_at?.slice(0, 10)
      const b = buckets.find(b => b.date === key)
      if (b) b.rx++
    })
    // For 30/90 day, sample every N buckets so chart isn't too dense
    if (days === 30) return buckets.filter((_, i) => i % 3 === 0 || i === buckets.length - 1)
    if (days === 90) return buckets.filter((_, i) => i % 7 === 0 || i === buckets.length - 1)
    return buckets
  }, [consults, rxList, days, lang])

  // Channel breakdown
  const byChannel = useMemo(() => {
    const map = {}
    consults.forEach(c => { map[c.channel] = (map[c.channel] ?? 0) + 1 })
    return Object.entries(map).map(([ch, n]) => ({ ch, n, pct: Math.round((n / (consults.length || 1)) * 100) }))
      .sort((a, b) => b.n - a.n)
  }, [consults])

  const CHANNEL_LABEL = { chat: lang === 'fr' ? 'Chat' : 'Chat', video: 'Vidéo/Video', audio: lang === 'fr' ? 'Audio' : 'Voice', whatsapp: 'WhatsApp' }

  const t = (en, fr) => lang === 'fr' ? fr : en

  return (
    <section id="reports" className="space-y-4">
      {/* Header + period picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0E1A15', margin: 0 }}>
          {t('Clinic Reports', 'Rapports de la clinique')}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: period === p.key ? C : '#F0EAE0',
                color: period === p.key ? '#fff' : '#666',
              }}>
              {lang === 'fr' ? p.labelFr : p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        <KPI label={t('Consultations', 'Consultations')} value={consults.length} sub={t(`${completedConsults} completed`, `${completedConsults} terminées`)} />
        <KPI label={t('Prescriptions', 'Ordonnances')} value={rxList.length} sub={t(`${rxFulfilled} fulfilled`, `${rxFulfilled} exécutées`)} />
        <KPI label={t('Appointments', 'Rendez-vous')} value={appts.length} sub={`${apptCompletionRate}% ${t('completed','terminés')}`} />
        <KPI label={t('Est. Revenue', 'Rev. estimé')} value={`$${estRevenue}`} sub={t('after 10% discount', 'après remise 10%')} color="#D99A2B" />
      </div>

      {/* Consultations chart */}
      <div style={{ background: '#fff', border: '1.5px solid #E5DDD0', borderRadius: 14, padding: '20px 20px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0E1A15', marginBottom: 16 }}>
          {t('Consultations over time', 'Consultations dans le temps')}
        </div>
        <MiniBar data={chartData} valueKey="consults" labelKey="label" color={C} height={100} />
      </div>

      {/* Prescriptions chart */}
      <div style={{ background: '#fff', border: '1.5px solid #E5DDD0', borderRadius: 14, padding: '20px 20px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0E1A15', marginBottom: 16 }}>
          {t('Prescriptions written', 'Ordonnances rédigées')}
        </div>
        <MiniBar data={chartData} valueKey="rx" labelKey="label" color="#D99A2B" height={100} />
      </div>

      {/* Channel breakdown + appointment status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {/* Channel breakdown */}
        <div style={{ background: '#fff', border: '1.5px solid #E5DDD0', borderRadius: 14, padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0E1A15', marginBottom: 14 }}>
            {t('By channel', 'Par canal')}
          </div>
          {byChannel.length === 0 ? (
            <p style={{ fontSize: 13, color: '#AAA' }}>{t('No data', 'Aucune donnée')}</p>
          ) : byChannel.map(({ ch, n, pct }) => (
            <div key={ch} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#555', fontWeight: 500 }}>{CHANNEL_LABEL[ch] ?? ch}</span>
                <span style={{ color: C, fontWeight: 700 }}>{n} <span style={{ color: '#AAA', fontWeight: 400 }}>({pct}%)</span></span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#F0EAE0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: C, borderRadius: 3, transition: 'width .4s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Appointment status */}
        <div style={{ background: '#fff', border: '1.5px solid #E5DDD0', borderRadius: 14, padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0E1A15', marginBottom: 14 }}>
            {t('Appointment status', 'Statut des rendez-vous')}
          </div>
          {appts.length === 0 ? (
            <p style={{ fontSize: 13, color: '#AAA' }}>{t('No appointments yet', 'Aucun rendez-vous')}</p>
          ) : [
            { label: t('Scheduled', 'Planifiés'),  n: appts.filter(a => a.status === 'scheduled').length,  color: C },
            { label: t('Completed', 'Terminés'),   n: apptCompleted,  color: '#2ECC71' },
            { label: t('Cancelled', 'Annulés'),    n: apptCancelled,  color: '#CF5A3C' },
          ].map(({ label, n, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8F4EE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#555' }}>{label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
