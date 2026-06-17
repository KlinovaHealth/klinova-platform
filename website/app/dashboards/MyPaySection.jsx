'use client'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'

const STATUS_COLORS = {
  paid:       { bg: '#E3EFE8', color: '#0E6B4F' },
  pending:    { bg: '#F4E2BC', color: '#D99A2B' },
  processing: { bg: '#EDE4D2', color: '#6E7F76' },
}

export default function MyPaySection({ userId }) {
  const supabase = createClient()
  const { t } = useLanguage()

  const { data: earnings = [], error } = useSWR('my-pay-' + userId, async () => {
    const { data, error } = await supabase
      .from('earnings')
      .select('id, period_label, amount, currency, status, payslip_url, paid_at, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }, { refreshInterval: 60000 })

  const totalPaid = earnings.filter(e => e.status === 'paid').reduce((s, e) => s + (e.amount ?? 0), 0)
  const pending   = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + (e.amount ?? 0), 0)

  return (
    <section id="pay" style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D0', padding: '20px 24px', marginTop: 24 }}>
      <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: '#15302A' }}>{t('myPay.title')}</h3>
      <p style={{ fontSize: 13, color: '#15302A99', marginBottom: 16 }}>{t('myPay.subtitle')}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: t('myPay.totalPaid'), value: fmt(totalPaid), sub: t('myPay.totalPaidSub') },
          { label: t('myPay.pending'),   value: fmt(pending),   sub: t('myPay.pendingSub') },
        ].map(s => (
          <div key={s.label} style={{ background: '#F5EFE3', borderRadius: 8, padding: '14px 16px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#15302A', margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: '#15302A80', margin: '2px 0 0' }}>{s.label} · {s.sub}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p style={{ fontSize: 13, color: '#CF5A3C' }}>{t('myPay.error')}</p>
      ) : earnings.length === 0 ? (
        <p style={{ fontSize: 13, color: '#15302A60' }}>{t('myPay.noRecords')}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E8E0D0' }}>
              {[t('col.period'), t('col.amount'), t('col.status'), t('myPay.view')].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#15302A99', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {earnings.map(e => {
              const s = STATUS_COLORS[e.status] ?? { bg: '#F5F5F5', color: '#6E7F76' }
              const statusLabel = t(`status.${e.status}`) !== `status.${e.status}` ? t(`status.${e.status}`) : e.status
              return (
                <tr key={e.id} style={{ borderBottom: '1px solid #F5EFE3' }}>
                  <td style={{ padding: '8px 8px', color: '#15302A' }}>{e.period_label ?? '—'}</td>
                  <td style={{ padding: '8px 8px', color: '#15302A', fontWeight: 500 }}>{fmt(e.amount)} {e.currency ?? 'XOF'}</td>
                  <td style={{ padding: '8px 8px' }}>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    {e.payslip_url
                      ? <a href={e.payslip_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0E6B4F', textDecoration: 'underline' }}>{t('myPay.view')}</a>
                      : '—'}
                  </td>
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
