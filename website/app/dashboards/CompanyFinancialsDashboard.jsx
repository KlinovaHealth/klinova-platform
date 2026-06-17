'use client'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'

const CAT_COLORS = {
  income:  { bg: '#E3EFE8', color: '#0E6B4F' },
  revenue: { bg: '#E3EFE8', color: '#0E6B4F' },
  expense: { bg: '#FBEEE8', color: '#CF5A3C' },
  tax:     { bg: '#F4E2BC', color: '#D99A2B' },
}

export default function CompanyFinancialsDashboard() {
  const supabase = createClient()
  const { t } = useLanguage()

  const { data: records = [], error } = useSWR('company-financials', async () => {
    const { data, error } = await supabase
      .from('company_financials')
      .select('id, category, label, amount, currency, period_start, period_end')
      .order('period_start', { ascending: false })
    if (error) throw error
    return data ?? []
  }, { refreshInterval: 120000 })

  const year = new Date().getFullYear()
  const thisYear = records.filter(r => r.period_start?.startsWith(String(year)))
  const sum = (cat) => thisYear.filter(r => r.category === cat).reduce((s, r) => s + (r.amount ?? 0), 0)

  const income   = sum('income') + sum('revenue')
  const expenses = sum('expense')
  const tax      = sum('tax')
  const net      = income - expenses - tax

  const summaryCards = [
    { labelKey: 'companyFinancials.income',   value: income,   color: '#0E6B4F', bg: '#E3EFE8' },
    { labelKey: 'companyFinancials.expenses', value: expenses, color: '#CF5A3C', bg: '#FBEEE8' },
    { labelKey: 'companyFinancials.tax',      value: tax,      color: '#D99A2B', bg: '#F4E2BC' },
    { labelKey: 'companyFinancials.net',      value: net,      color: net >= 0 ? '#0E6B4F' : '#CF5A3C', bg: net >= 0 ? '#E3EFE8' : '#FBEEE8' },
  ]

  return (
    <section id="financials" style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D0', padding: '20px 24px', marginTop: 24 }}>
      <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: '#15302A' }}>{t('companyFinancials.title')}</h3>
      <p style={{ fontSize: 13, color: '#15302A99', marginBottom: 16 }}>
        {t('companyFinancials.subtitle', { year })}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {summaryCards.map(s => (
          <div key={s.labelKey} style={{ background: s.bg, borderRadius: 8, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{fmt(s.value)}</p>
            <p style={{ fontSize: 12, color: '#15302A80', margin: '2px 0 0' }}>{t(s.labelKey)} · {year}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p style={{ fontSize: 13, color: '#CF5A3C' }}>{t('companyFinancials.accessDenied')}</p>
      ) : records.length === 0 ? (
        <p style={{ fontSize: 13, color: '#15302A60' }}>{t('companyFinancials.noRecords')}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E8E0D0' }}>
              {[t('col.category'), t('col.label'), t('col.amount'), t('col.period')].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#15302A99', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map(r => {
              const s = CAT_COLORS[r.category] ?? { bg: '#F5F5F5', color: '#6E7F76' }
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #F5EFE3' }}>
                  <td style={{ padding: '8px 8px' }}>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      {r.category}
                    </span>
                  </td>
                  <td style={{ padding: '8px 8px', color: '#15302A' }}>{r.label}</td>
                  <td style={{ padding: '8px 8px', color: '#15302A', fontWeight: 500 }}>{fmt(r.amount)} {r.currency ?? 'XOF'}</td>
                  <td style={{ padding: '8px 8px', color: '#15302A80' }}>{r.period_start ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

function fmt(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-TG', { maximumFractionDigits: 0 }).format(n)
}
