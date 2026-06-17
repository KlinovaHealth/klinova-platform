'use client'
import { useState, useRef } from 'react'
import useSWR from 'swr'
import { useLanguage } from '@/contexts/LanguageContext'

const CURRENCIES = ['XOF', 'USD', 'EUR', 'GHS', 'NGN', 'MAD']
const STATUSES   = ['pending', 'processing', 'paid']

const STATUS_STYLE = {
  paid:       { bg: '#E3EFE8', color: '#0E6B4F' },
  pending:    { bg: '#F4E2BC', color: '#D99A2B' },
  processing: { bg: '#EDE4D2', color: '#6E7F76' },
}

const inpStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid #E8E0D0', background: '#F5EFE3',
  color: '#15302A', fontSize: 13, outline: 'none', boxSizing: 'border-box',
}

export default function PayrollAdminSection({ userId }) {
  const { t } = useLanguage()
  const fileRef = useRef(null)

  const empty = { person_id: '', period_label: '', amount: '', currency: 'XOF', status: 'pending', payslip_url: '', file: null }
  const [form, setForm]   = useState(empty)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]     = useState({ type: '', text: '' })
  const [deleting, setDel] = useState(null)

  const fetcher = () =>
    fetch('/api/admin/payroll', { headers: { 'x-user-id': userId } }).then(r => r.json())

  const { data, mutate, error } = useSWR(`payroll-admin-${userId}`, fetcher, { refreshInterval: 60000 })

  const employees = data?.users    ?? []
  const records   = data?.earnings ?? []

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setMsg({ type: '', text: '' })
    try {
      let res
      if (form.file) {
        const fd = new FormData()
        fd.append('person_id',    form.person_id)
        fd.append('period_label', form.period_label)
        fd.append('amount',       form.amount)
        fd.append('currency',     form.currency)
        fd.append('status',       form.status)
        if (form.payslip_url) fd.append('payslip_url', form.payslip_url)
        fd.append('file', form.file)
        res = await fetch('/api/admin/payroll', { method: 'POST', headers: { 'x-user-id': userId }, body: fd })
      } else {
        res = await fetch('/api/admin/payroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
          body: JSON.stringify({
            person_id:    form.person_id,
            period_label: form.period_label,
            amount:       parseFloat(form.amount),
            currency:     form.currency,
            status:       form.status,
            payslip_url:  form.payslip_url || null,
          }),
        })
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setMsg({ type: 'success', text: t('payroll.saveSuccess') })
      setForm(empty)
      if (fileRef.current) fileRef.current.value = ''
      mutate()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('payroll.deleteConfirm'))) return
    setDel(id)
    try {
      const res  = await fetch('/api/admin/payroll', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      mutate()
    } catch (err) {
      alert(err.message)
    } finally {
      setDel(null)
    }
  }

  return (
    <section id="payroll" style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D0', padding: '20px 24px', marginTop: 8 }}>
      <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 2, color: '#15302A' }}>{t('payroll.title')}</h3>
      <p style={{ fontSize: 13, color: '#15302A80', marginBottom: 20 }}>{t('payroll.subtitle')}</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {/* Employee */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Label>{t('payroll.employee')}<Req /></Label>
          <select required value={form.person_id}
            onChange={e => setForm(f => ({ ...f, person_id: e.target.value }))}
            style={inpStyle}>
            <option value="">{t('payroll.selectEmployee')}</option>
            {employees.map(u => (
              <option key={u.id} value={u.id}>{u.full_name} — {u.role}</option>
            ))}
          </select>
        </div>

        {/* Period */}
        <div>
          <Label>{t('payroll.period')}<Req /></Label>
          <input type="text" required value={form.period_label}
            onChange={e => setForm(f => ({ ...f, period_label: e.target.value }))}
            placeholder={t('payroll.periodPlaceholder')}
            style={inpStyle} />
        </div>

        {/* Amount */}
        <div>
          <Label>{t('payroll.amount')} ({form.currency})<Req /></Label>
          <input type="number" required min="0" step="0.01" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="0"
            style={inpStyle} />
        </div>

        {/* Currency */}
        <div>
          <Label>{t('payroll.currency')}</Label>
          <select value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            style={inpStyle}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <Label>{t('payroll.status')}</Label>
          <select value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            style={inpStyle}>
            {STATUSES.map(s => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </select>
        </div>

        {/* File upload */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Label>{t('payroll.uploadFile')}</Label>
          <input ref={fileRef} type="file"
            accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
            onChange={e => setForm(f => ({ ...f, file: e.target.files[0] ?? null }))}
            style={{ fontSize: 13, color: '#15302A' }} />
        </div>

        {/* URL paste */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Label>{t('payroll.orPasteUrl')}</Label>
          <input type="url" value={form.payslip_url}
            onChange={e => setForm(f => ({ ...f, payslip_url: e.target.value }))}
            placeholder={t('payroll.urlPlaceholder')}
            style={inpStyle} />
        </div>

        {msg.text && (
          <div style={{
            gridColumn: '1 / -1', padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: msg.type === 'success' ? '#E3EFE8' : '#FBEEE8',
            color:      msg.type === 'success' ? '#0E6B4F' : '#CF5A3C',
            border: `1px solid ${msg.type === 'success' ? '#0E6B4F30' : '#CF5A3C30'}`,
          }}>
            {msg.text}
          </div>
        )}

        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" disabled={saving} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: '#0E6B4F', color: '#fff', fontWeight: 600, fontSize: 13,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? t('payroll.saving') : t('payroll.saveRecord')}
          </button>
        </div>
      </form>

      <h4 style={{ fontWeight: 600, fontSize: 14, color: '#15302A', marginBottom: 12 }}>{t('payroll.allRecords')}</h4>

      {error ? (
        <p style={{ fontSize: 13, color: '#CF5A3C' }}>Could not load records.</p>
      ) : records.length === 0 ? (
        <p style={{ fontSize: 13, color: '#15302A60' }}>{t('payroll.noRecords')}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E8E0D0' }}>
                {[t('col.name'), t('col.period'), t('col.amount'), t('col.status'), t('col.payslip'), ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600, color: '#15302A80', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const ss  = STATUS_STYLE[r.status] ?? { bg: '#EDE4D2', color: '#6E7F76' }
                const emp = r.users
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F5EFE3' }}>
                    <td style={{ padding: '9px 10px', color: '#15302A', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 500 }}>{emp?.full_name ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#15302A60' }}>{emp?.email ?? ''}</div>
                    </td>
                    <td style={{ padding: '9px 10px', color: '#15302A' }}>{r.period_label ?? '—'}</td>
                    <td style={{ padding: '9px 10px', color: '#15302A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {fmt(r.amount)} {r.currency ?? 'XOF'}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{ background: ss.bg, color: ss.color, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600 }}>
                        {t(`status.${r.status}`)}
                      </span>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      {r.payslip_url ? (
                        <a href={r.payslip_url} target="_blank" rel="noreferrer"
                          style={{ color: '#0E6B4F', fontWeight: 500, textDecoration: 'underline', fontSize: 12 }}>
                          {t('myPay.view')}
                        </a>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                      <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                        style={{ fontSize: 11, color: '#CF5A3C', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
                        {deleting === r.id ? '…' : '✕'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#15302A', marginBottom: 5 }}>{children}</label>
}
function Req() {
  return <span style={{ color: '#CF5A3C', marginLeft: 2 }}>*</span>
}
function fmt(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-TG', { maximumFractionDigits: 0 }).format(n)
}
