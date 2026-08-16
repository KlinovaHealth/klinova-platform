'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { StatCard, Table, Alert, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import MyPaySection from './MyPaySection'
import PayrollAdminSection from './PayrollAdminSection'
import ApplicationsSection from './ApplicationsSection'

const KlinovaMapSection = dynamic(() => import('./KlinovaMapSection'), { ssr: false })

const C = '#15302A'
const ROLES = ['patient', 'doctor', 'pharmacist', 'admin', 'analyst', 'nurse', 'marketing', 'frontdesk', 'owner']
const DOCTOR_TYPES = [
  { value: 'partner',  label: 'Partner doctor',      sub: 'External licensed provider on the network' },
  { value: 'inhouse',  label: 'In-house teledoctor', sub: 'Klinova staff — handles routine cases & refills' },
]

const fetchStats = () => fetch('/api/admin/stats').then(r => r.json())

export default function AdminDashboard({ userId, name }) {
  const { t } = useLanguage()
  const { data, mutate: mutateAll } = useSWR('admin-stats', fetchStats, { refreshInterval: 30000 })

  const userCount     = data?.userCount     ?? 0
  const activeCon     = data?.activeConsults ?? 0
  const pharmacyCount = data?.pharmacyCount  ?? 0
  const recentUsers   = data?.recentUsers    ?? []
  const pharmacies    = data?.pharmacies     ?? []

  const empty = { email: '', full_name: '', role: 'patient', temp_password: '', pharmacy_id: '', doctor_type: 'partner' }
  const [form, setForm]         = useState(empty)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError]     = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  async function handleCreateUser(e) {
    e.preventDefault()
    setCreating(true); setCreateError(''); setCreateSuccess('')
    const body = { ...form }
    if (form.role !== 'pharmacist') delete body.pharmacy_id
    if (form.role !== 'doctor') delete body.doctor_type
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
                <option key={r} value={r}>{t(`roles.${r}`) || r}</option>
              ))}
            </select>
          </Field>
          <Field label={t('admin.form.tempPassword')} required>
            <input type="text" required minLength={8} value={form.temp_password}
              onChange={e => setForm(f => ({ ...f, temp_password: e.target.value }))}
              className={inputCls} placeholder={t('admin.form.tempPasswordPlaceholder')} />
          </Field>
          {form.role === 'doctor' && (
            <Field label="Doctor type" className="sm:col-span-2">
              <div className="flex gap-3 flex-wrap mt-1">
                {DOCTOR_TYPES.map(dt => (
                  <button key={dt.value} type="button"
                    onClick={() => setForm(f => ({ ...f, doctor_type: dt.value }))}
                    className="flex-1 min-w-[200px] text-left px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      borderColor:   form.doctor_type === dt.value ? C : '#E7DECC',
                      background:    form.doctor_type === dt.value ? '#15302A08' : '#fff',
                    }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: form.doctor_type === dt.value ? C : '#D0C8BC' }}>
                        {form.doctor_type === dt.value && (
                          <div className="w-2 h-2 rounded-full" style={{ background: C }} />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-ink">{dt.label}</span>
                    </div>
                    <p className="text-xs text-ink/50 ml-6">{dt.sub}</p>
                  </button>
                ))}
              </div>
            </Field>
          )}
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
              <RoleBadge key={u.id} role={u.role} doctorType={u.doctor_type} />,
              fmtDate(u.created_at),
            ])}
          />
        )}
      </section>

      <ApplicationsSection />

      <KlinovaMapSection />

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

function RoleBadge({ role, doctorType }) {
  const map = {
    patient:    { bg: '#E3EFE8', color: '#0E6B4F',  label: 'Patient' },
    doctor:     { bg: '#E3EFE8', color: '#0A5440',  label: 'Doctor' },
    pharmacist: { bg: '#F4E2BC', color: '#D99A2B',  label: 'Pharmacist' },
    admin:      { bg: '#EDE4D2', color: '#15302A',  label: 'Admin' },
    analyst:    { bg: '#E3EFE8', color: '#6E7F76',  label: 'Analyst' },
    nurse:      { bg: '#E3EFE8', color: '#0E6B4F',  label: 'Nurse' },
    marketing:  { bg: '#F4E2BC', color: '#E0A23B',  label: 'Marketing' },
    frontdesk:  { bg: '#FBEEE8', color: '#CF5A3C',  label: 'Frontdesk' },
    owner:      { bg: '#E3EFE8', color: '#0A5440',  label: 'Owner' },
    government: { bg: '#EDE4D2', color: '#15302A',  label: 'Government' },
  }
  const s = map[role] ?? { bg: '#F5EFE3', color: '#15302A', label: role }

  if (role === 'doctor' && doctorType) {
    const isInhouse = doctorType === 'inhouse'
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: isInhouse ? '#F4E2BC' : s.bg, color: isInhouse ? '#D99A2B' : s.color }}>
        {isInhouse ? 'Teledoctor' : 'Partner MD'}
      </span>
    )
  }

  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}
