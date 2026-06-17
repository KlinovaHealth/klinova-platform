'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { StatCard, Table, Alert, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'
import PayrollAdminSection from './PayrollAdminSection'

const C = '#15302A'
const ROLES = ['patient', 'doctor', 'pharmacist', 'admin', 'analyst', 'nurse', 'marketing', 'frontdesk', 'owner']

const fetchStats = () => fetch('/api/admin/stats').then(r => r.json())

export default function AdminDashboard({ userId, name }) {
  const { t } = useLanguage()
  const { data, mutate: mutateAll } = useSWR('admin-stats', fetchStats, { refreshInterval: 30000 })

  const userCount     = data?.userCount     ?? 0
  const activeCon     = data?.activeConsults ?? 0
  const pharmacyCount = data?.pharmacyCount  ?? 0
  const recentUsers   = data?.recentUsers    ?? []
  const pharmacies    = data?.pharmacies     ?? []

  const empty = { email: '', full_name: '', role: 'patient', temp_password: '', pharmacy_id: '' }
  const [form, setForm]         = useState(empty)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError]     = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  async function handleCreateUser(e) {
    e.preventDefault()
    setCreating(true); setCreateError(''); setCreateSuccess('')
    const body = { ...form }
    if (form.role !== 'pharmacist') delete body.pharmacy_id
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) {
      setCreateError(json.error ?? 'Failed to create user.')
    } else {
      setCreateSuccess(t('admin.createSuccess', { name: form.full_name }))
      setForm(empty)
      mutateAll()
    }
    setCreating(false)
  }

  const inputCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#15302A] focus:border-[#15302A]`

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{getGreeting(name, t)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">{t('admin.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('admin.stats.totalUsers')}     value={userCount}     color={C} sub={t('admin.stats.totalUsersSub')} />
        <StatCard label={t('admin.stats.activeConsults')} value={activeCon}     color={C} sub={t('admin.stats.activeConsultsSub')} />
        <StatCard label={t('admin.stats.pharmacies')}     value={pharmacyCount} color={C} sub={t('admin.stats.pharmaciesSub')} />
      </div>

      <section id="create" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">{t('admin.createAccount')}</h3>
        <p className="text-sm text-ink/55 mb-4">{t('admin.createAccountDesc')}</p>

        {createError   && <Alert type="error"   msg={createError} />}
        {createSuccess && <Alert type="success" msg={createSuccess} />}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('admin.form.fullName')} required>
            <input type="text" required value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className={inputCls} placeholder="Koffi Mensah" />
          </Field>
          <Field label={t('admin.form.email')} required>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={inputCls} placeholder="koffi@example.com" />
          </Field>
          <Field label={t('admin.form.role')} required>
            <select required value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className={inputCls}>
              {ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('admin.form.tempPassword')} required>
            <input type="text" required minLength={8} value={form.temp_password}
              onChange={e => setForm(f => ({ ...f, temp_password: e.target.value }))}
              className={inputCls} placeholder={t('admin.form.tempPasswordPlaceholder')} />
          </Field>
          {form.role === 'pharmacist' && (
            <Field label={t('admin.form.assignPharmacy')} className="sm:col-span-2">
              <select value={form.pharmacy_id}
                onChange={e => setForm(f => ({ ...f, pharmacy_id: e.target.value }))}
                className={inputCls}>
                <option value="">{t('admin.form.noPharmacyYet')}</option>
                {pharmacies.map(ph => (
                  <option key={ph.id} value={ph.id}>{ph.name}</option>
                ))}
              </select>
            </Field>
          )}
          <div className="sm:col-span-2">
            <button type="submit" disabled={creating}
              className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm
                         hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
              style={{ background: C }}>
              {creating ? t('admin.creating') : t('admin.createBtn')}
            </button>
          </div>
        </form>
      </section>

      <section id="users" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">{t('admin.recentAccounts')}</h3>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-ink/50">{t('admin.noUsers')}</p>
        ) : (
          <Table
            cols={[t('col.name'), t('col.email'), t('col.role'), t('col.created')]}
            rows={recentUsers.map(u => [
              u.full_name ?? '—',
              u.email ?? '—',
              <RoleBadge key={u.id} role={u.role} />,
              fmtDate(u.created_at),
            ])}
          />
        )}
      </section>

      <PayrollAdminSection userId={userId} />

      <MyPaySection userId={userId} />
    </div>
  )
}

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink mb-1">
        {label}{required && <span className="text-[#CF5A3C] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function RoleBadge({ role }) {
  const map = {
    patient:    { bg: '#E3EFE8', color: '#0E6B4F' },
    doctor:     { bg: '#E3EFE8', color: '#0A5440' },
    pharmacist: { bg: '#F4E2BC', color: '#D99A2B' },
    admin:      { bg: '#EDE4D2', color: '#15302A' },
    analyst:    { bg: '#E3EFE8', color: '#6E7F76' },
    nurse:      { bg: '#E3EFE8', color: '#0E6B4F' },
    marketing:  { bg: '#F4E2BC', color: '#E0A23B' },
    frontdesk:  { bg: '#FBEEE8', color: '#CF5A3C' },
    owner:      { bg: '#E3EFE8', color: '#0A5440' },
  }
  const s = map[role] ?? { bg: '#F5EFE3', color: '#15302A' }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {role}
    </span>
  )
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}
