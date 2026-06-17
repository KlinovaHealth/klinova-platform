'use client'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, StatusBadge, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'

const C = '#E0A23B'

export default function MarketingDashboard({ userId, name }) {
  const supabase = createClient()
  const { t } = useLanguage()

  const { data: campaigns = [], error: campaignsErr } = useSWR('marketing-campaigns', async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, title, channel, status, reach, conversions, budget, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }, { refreshInterval: 60000 })

  const { data: leads = [], error: leadsErr } = useSWR('marketing-leads', async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, phone, source, status, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }, { refreshInterval: 30000 })

  const totalCampaigns  = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalLeads      = leads.length
  const convertedLeads  = leads.filter(l => l.status === 'converted').length

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{getGreeting(name, t)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">{t('marketing.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label={t('marketing.stats.totalCampaigns')}  value={totalCampaigns}  color={C} sub={t('marketing.stats.totalCampaignsSub')} />
        <StatCard label={t('marketing.stats.activeCampaigns')} value={activeCampaigns} color={C} sub={t('marketing.stats.activeCampaignsSub')} />
        <StatCard label={t('marketing.stats.totalLeads')}      value={totalLeads}      color={C} sub={t('marketing.stats.totalLeadsSub')} />
        <StatCard label={t('marketing.stats.converted')}       value={convertedLeads}  color={C} sub={t('marketing.stats.convertedSub')} />
      </div>

      <section id="campaigns" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">{t('marketing.campaigns')}</h3>
        {campaignsErr ? (
          <p className="text-sm text-ink/50">{t('marketing.noData')}</p>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-ink/50">{t('marketing.noCampaigns')}</p>
        ) : (
          <Table
            cols={[t('col.title'), t('col.channel'), t('col.status'), t('col.reach'), t('col.conversions'), t('col.budget')]}
            rows={campaigns.map(c => [
              c.title ?? '—',
              t(`channels.${c.channel}`) !== `channels.${c.channel}` ? t(`channels.${c.channel}`) : (c.channel ?? '—'),
              <StatusBadge key={c.id} status={c.status} />,
              c.reach ?? '—',
              c.conversions ?? '—',
              fmt(c.budget),
            ])}
          />
        )}
      </section>

      <section id="leads" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">{t('marketing.leads')}</h3>
        {leadsErr ? (
          <p className="text-sm text-ink/50">{t('marketing.noData')}</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-ink/50">{t('marketing.noLeads')}</p>
        ) : (
          <Table
            cols={[t('col.name'), t('col.phone'), t('col.source'), t('col.status'), t('col.created')]}
            rows={leads.map(l => [
              l.name ?? '—',
              l.phone ?? '—',
              l.source ?? '—',
              <LeadStatusBadge key={l.id} status={l.status} t={t} />,
              fmtDate(l.created_at),
            ])}
          />
        )}
      </section>

      <MyPaySection userId={userId} />
    </div>
  )
}

function LeadStatusBadge({ status, t }) {
  const map = {
    new:       { bg: '#EDE4D2', color: '#6E7F76' },
    contacted: { bg: '#F4E2BC', color: '#D99A2B' },
    converted: { bg: '#E3EFE8', color: '#0E6B4F' },
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

function fmt(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-TG', { maximumFractionDigits: 0 }).format(n)
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}
