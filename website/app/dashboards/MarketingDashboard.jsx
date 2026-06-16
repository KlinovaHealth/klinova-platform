'use client'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, StatusBadge, Alert } from './PatientDashboard'
import MyPaySection from './MyPaySection'

const C = '#B45309'

function getGreeting(name) {
  const h = new Date().getHours()
  const p = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${p}${name ? `, ${name.split(' ')[0]}` : ''}`
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmt(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-TG', { maximumFractionDigits: 0 }).format(n)
}

function LeadStatusBadge({ status }) {
  const map = {
    new:       { bg: '#E8F0F5', color: '#2C6E8F', label: 'New'       },
    contacted: { bg: '#FBF4E5', color: '#D99A2B', label: 'Contacted' },
    converted: { bg: '#E8F3EF', color: '#0E6B4F', label: 'Converted' },
  }
  const s = map[status] ?? { bg: '#F5EFE3', color: '#15302A', label: status }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default function MarketingDashboard({ userId, name }) {
  const supabase = createClient()

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
          className="text-2xl font-semibold text-ink">{getGreeting(name)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">Campaigns, leads, and outreach.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total campaigns"  value={totalCampaigns}  color={C} sub="all time" />
        <StatCard label="Active campaigns" value={activeCampaigns} color={C} sub="running now" />
        <StatCard label="Total leads"      value={totalLeads}      color={C} sub="captured" />
        <StatCard label="Converted"        value={convertedLeads}  color={C} sub="leads" />
      </div>

      <section id="campaigns" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Campaigns</h3>
        {campaignsErr ? (
          <p className="text-sm text-ink/50">No data yet.</p>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-ink/50">No campaigns yet.</p>
        ) : (
          <Table
            cols={['Title', 'Channel', 'Status', 'Reach', 'Conversions', 'Budget']}
            rows={campaigns.map(c => [
              c.title ?? '—',
              c.channel ?? '—',
              <StatusBadge key={c.id} status={c.status} />,
              c.reach ?? '—',
              c.conversions ?? '—',
              fmt(c.budget),
            ])}
          />
        )}
      </section>

      <section id="leads" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Leads</h3>
        {leadsErr ? (
          <p className="text-sm text-ink/50">No data yet.</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-ink/50">No leads yet.</p>
        ) : (
          <Table
            cols={['Name', 'Phone', 'Source', 'Status', 'Created']}
            rows={leads.map(l => [
              l.name ?? '—',
              l.phone ?? '—',
              l.source ?? '—',
              <LeadStatusBadge key={l.id} status={l.status} />,
              fmtDate(l.created_at),
            ])}
          />
        )}
      </section>

      <MyPaySection userId={userId} />
    </div>
  )
}
