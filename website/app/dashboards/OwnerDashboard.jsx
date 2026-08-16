'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, Alert, getGreeting } from './PatientDashboard'
import { useLanguage } from '@/contexts/LanguageContext'
import CompanyFinancialsDashboard from './CompanyFinancialsDashboard'
import MyPaySection from './MyPaySection'
import PayrollAdminSection from './PayrollAdminSection'
import ApplicationsSection from './ApplicationsSection'

const KlinovaMapSection    = dynamic(() => import('./KlinovaMapSection'), { ssr: false })
const OutbreakAlertSection = dynamic(() => import('./OutbreakAlertSection'), { ssr: false })

const C = '#0A5440'
const ALL_ROLES = ['patient', 'doctor', 'pharmacist', 'admin', 'analyst', 'nurse', 'marketing', 'frontdesk', 'owner', 'government']

export default function OwnerDashboard({ userId, name, financeAdmin }) {
  const supabase = createClient()
  const { t } = useLanguage()

  const { data: userCount = 0 } = useSWR('owner-user-count', async () => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: activeCon = 0 } = useSWR('owner-active-consults', async () => {
    const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).in('status', ['waiting', 'active'])
    return count ?? 0
  }, { refreshInterval: 15000 })

  const { data: pharmacyCount = 0 } = useSWR('owner-pharmacy-count', async () => {
    const { count } = await supabase.from('pharmacies').select('*', { count: 'exact', head: true })
    return count ?? 0
  }, { refreshInterval: 60000 })

  const { data: recentUsers = [], mutate: mutateUsers } = useSWR('owner-recent-users', async () => {
    const { data } = await supabase.from('users')
      .select('id, full_name, email, role, created_at, account_disabled, can_manage_accounts')
      .order('created_at', { ascending: false }).limit(50)
    return data ?? []
  }, { refreshInterval: 30000 })

  const { data: pharmacies = [] } = useSWR('owner-pharmacies-list', async () => {
    const { data } = await supabase.from('pharmacies').select('id, name').order('name')
    return data ?? []
  })

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
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) {
      setCreateError(json.error ?? 'Failed to create user.')
    } else {
      setCreateSuccess(t('admin.createSuccess', { name: form.full_name }))
      setForm(empty); mutateUsers()
    }
    setCreating(false)
  }

  const inputCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#0A5440] focus:border-[#0A5440]`

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{getGreeting(name, t)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">{t('owner.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('admin.stats.totalUsers')}     value={userCount}     color={C} sub={t('admin.stats.totalUsersSub')} />
        <StatCard label={t('admin.stats.activeConsults')} value={activeCon}     color={C} sub={t('admin.stats.activeConsultsSub')} />
        <StatCard label={t('admin.stats.pharmacies')}     value={pharmacyCount} color={C} sub={t('admin.stats.pharmaciesSub')} />
      </div>

      {financeAdmin && <CompanyFinancialsDashboard />}

      <ApplicationsSection />

      <OutbreakAlertSection userRole="owner" />

      <KlinovaMapSection />

      <GovAccountsSection />

      <PharmacyManagementSection />

      <section id="create" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">{t('admin.createAccount')}</h3>
        <p className="text-sm text-ink/55 mb-4">{t('admin.createAccountDesc')}</p>

        {createError   && <Alert type="error"   msg={createError} />}
        {createSuccess && <Alert type="success" msg={createSuccess} />}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OField label={t('admin.form.fullName')} required>
            <input type="text" required value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className={inputCls} placeholder="Koffi Mensah" />
          </OField>
          <OField label={t('admin.form.email')} required>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={inputCls} placeholder="koffi@example.com" />
          </OField>
          <OField label={t('admin.form.role')} required>
            <select required value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className={inputCls}>
              {ALL_ROLES.map(r => (
                <option key={r} value={r}>{t(`roles.${r}`) || r}</option>
              ))}
            </select>
          </OField>
          <OField label={t('admin.form.tempPassword')} required>
            <input type="text" required minLength={8} value={form.temp_password}
              onChange={e => setForm(f => ({ ...f, temp_password: e.target.value }))}
              className={inputCls} placeholder={t('admin.form.tempPasswordPlaceholder')} />
          </OField>
          {form.role === 'pharmacist' && (
            <OField label={t('admin.form.assignPharmacy')} className="sm:col-span-2">
              <select value={form.pharmacy_id}
                onChange={e => setForm(f => ({ ...f, pharmacy_id: e.target.value }))}
                className={inputCls}>
                <option value="">{t('admin.form.noPharmacyYet')}</option>
                {pharmacies.map(ph => (
                  <option key={ph.id} value={ph.id}>{ph.name}</option>
                ))}
              </select>
            </OField>
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
        <h3 className="font-semibold text-ink mb-1">{t('admin.recentAccounts')}</h3>
        <p className="text-xs text-ink/40 mb-4">Click any row to manage role, rights, or account status.</p>
        <UserManagementTable users={recentUsers} onRefresh={mutateUsers} />
      </section>

      <PayrollAdminSection userId={userId} />

      <MyPaySection userId={userId} />
    </div>
  )
}

function OField({ label, required, children, className = '' }) {
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

function PharmacyManagementSection() {
  const supabase = createClient()
  const emptyPh = { name: '', address: '', phone: '', email: '' }
  const [form, setForm] = useState(emptyPh)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  const { data: pharmacies = [], mutate } = useSWR('owner-pharmacies-full', async () => {
    const { data } = await supabase.from('pharmacies').select('id, name, address, phone, email').order('name')
    return data ?? []
  })

  const inputCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#0A5440] focus:border-[#0A5440]`

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true); setErr(''); setOk('')
    const res = await fetch('/api/admin/create-pharmacy', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok) { setErr(json.error ?? 'Failed to create pharmacy.') }
    else { setOk(`${json.pharmacy.name} created successfully.`); setForm(emptyPh); mutate() }
    setSaving(false)
  }

  return (
    <section id="pharmacies" className="bg-white rounded-xl border border-border shadow-card p-5">
      <h3 className="font-semibold text-ink mb-1">Pharmacies</h3>
      <p className="text-sm text-ink/50 mb-4">Create a pharmacy then assign pharmacist accounts to it.</p>

      {pharmacies.length > 0 && (
        <div className="space-y-2 mb-5">
          {pharmacies.map(ph => (
            <div key={ph.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-ivory">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{ph.name}</p>
                <p className="text-xs text-ink/40 mt-0.5">
                  {[ph.address, ph.phone, ph.email].filter(Boolean).join(' · ') || 'No contact info'}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E3EFE8] text-[#0A5440] font-medium shrink-0">Active</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-ink mb-3">Add new pharmacy</p>
      {err && <div className="mb-3 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{err}</div>}
      {ok  && <div className="mb-3 px-4 py-2 rounded-lg bg-[#E3EFE8] border border-[#0A5440]/20 text-[#0A5440] text-sm">{ok}</div>}
      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OField label="Pharmacy name" required>
          <input type="text" required value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className={inputCls} placeholder="Pharmacie Centrale" />
        </OField>
        <OField label="Address">
          <input type="text" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className={inputCls} placeholder="Rue du Commerce, Lomé" />
        </OField>
        <OField label="Phone">
          <input type="tel" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className={inputCls} placeholder="+228 90 00 00 00" />
        </OField>
        <OField label="Email">
          <input type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className={inputCls} placeholder="pharmacie@example.com" />
        </OField>
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50"
            style={{ background: '#0A5440' }}>
            {saving ? 'Creating…' : 'Create pharmacy'}
          </button>
        </div>
      </form>
    </section>
  )
}

function UserManagementTable({ users, onRefresh }) {
  const [expanded, setExpanded] = useState(null)
  const [busy, setBusy] = useState(null)
  const [roleEdit, setRoleEdit] = useState({})

  async function manageAccount(action, targetId, value) {
    setBusy(`${action}-${targetId}`)
    await fetch('/api/admin/manage-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, targetId, value }),
    })
    onRefresh()
    setBusy(null)
  }

  if (users.length === 0) return <p className="text-sm text-ink/50">No users yet.</p>

  return (
    <div className="space-y-2">
      {users.map(u => {
        const open = expanded === u.id
        const isDisabled = u.account_disabled ?? false
        const hasMgmt = u.can_manage_accounts ?? false
        const isAdmin = u.role === 'admin'

        return (
          <div key={u.id}
            className={`rounded-lg border ${isDisabled ? 'border-red-200 bg-red-50/30' : 'border-border bg-ivory'}`}>
            <button
              onClick={() => setExpanded(open ? null : u.id)}
              className="w-full flex items-center gap-3 p-3 text-left">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-ink">{u.full_name ?? '—'}</span>
                <span className="text-xs text-ink/40 ml-2 hidden sm:inline">{u.email}</span>
              </div>
              <RoleBadge role={u.role} />
              {isDisabled && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                  Disabled
                </span>
              )}
              {isAdmin && hasMgmt && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                  Can manage
                </span>
              )}
              <span className="text-ink/30 text-xs">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
              <div className="px-3 pb-3 border-t border-border/50 pt-3 space-y-3">
                <p className="text-xs text-ink/40">{u.email} · Joined {fmtDate(u.created_at)}</p>

                {/* Change role */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-ink/50 w-20 shrink-0">Change role</span>
                  <select
                    value={roleEdit[u.id] ?? u.role}
                    onChange={e => setRoleEdit(r => ({ ...r, [u.id]: e.target.value }))}
                    className="text-xs px-2 py-1.5 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-1 focus:ring-kgreen">
                    {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {roleEdit[u.id] && roleEdit[u.id] !== u.role && (
                    <button
                      onClick={() => manageAccount('change_role', u.id, roleEdit[u.id])}
                      disabled={!!busy}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#0A5440] text-white font-medium disabled:opacity-40 hover:opacity-90">
                      {busy === `change_role-${u.id}` ? '…' : 'Apply'}
                    </button>
                  )}
                </div>

                {/* Enable / Disable account */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink/50 w-20 shrink-0">Account</span>
                  <button
                    onClick={() => manageAccount(isDisabled ? 'enable_account' : 'disable_account', u.id)}
                    disabled={!!busy}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border disabled:opacity-40
                      ${isDisabled
                        ? 'border-[#0A5440] text-[#0A5440] hover:bg-[#E3EFE8]'
                        : 'border-red-400 text-red-600 hover:bg-red-50'}`}>
                    {busy === `${isDisabled ? 'enable' : 'disable'}_account-${u.id}` ? '…'
                      : isDisabled ? 'Enable account' : 'Disable account'}
                  </button>
                </div>

                {/* Grant / Revoke account management (admin only) */}
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink/50 w-20 shrink-0">Rights</span>
                    <button
                      onClick={() => manageAccount(hasMgmt ? 'revoke_manage_accounts' : 'grant_manage_accounts', u.id)}
                      disabled={!!busy}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-40">
                      {busy === `${hasMgmt ? 'revoke' : 'grant'}_manage_accounts-${u.id}` ? '…'
                        : hasMgmt ? 'Revoke account mgmt' : 'Grant account mgmt'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function GovAccountsSection() {
  const supabase = createClient()
  const { data: govUsers = [], mutate } = useSWR('gov-users', async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, gov_subscribed, created_at')
      .eq('role', 'government')
      .order('created_at', { ascending: false })
    return data ?? []
  }, { refreshInterval: 30000 })

  const [toggling, setToggling] = useState(null)

  async function toggle(userId, current) {
    setToggling(userId)
    await fetch('/api/admin/manage-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_gov', targetId: userId, value: !current }),
    })
    mutate()
    setToggling(null)
  }

  return (
    <section id="gov" className="bg-white rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-ink">Government Accounts</h3>
          <p className="text-sm text-ink/50 mt-0.5">Toggle subscription to grant access to the Government Portal.</p>
        </div>
        <a href="/gov" target="_blank"
          className="text-xs px-3 py-1.5 rounded-lg border border-[#0A5440] text-[#0A5440] hover:bg-[#E3EFE8] font-medium">
          Preview Portal ↗
        </a>
      </div>

      {govUsers.length === 0 ? (
        <p className="text-sm text-ink/40">
          No government accounts yet. Create one above by selecting the &quot;Government&quot; role.
        </p>
      ) : (
        <div className="space-y-3">
          {govUsers.map(u => (
            <div key={u.id}
              className="flex items-center gap-4 p-3 rounded-lg border border-border bg-ivory">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{u.full_name ?? '—'}</p>
                <p className="text-xs text-ink/50 truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  u.gov_subscribed
                    ? 'bg-[#E3EFE8] text-[#0A5440]'
                    : 'bg-[#EDE4D2] text-ink/50'
                }`}>
                  {u.gov_subscribed ? 'Subscribed' : 'Not subscribed'}
                </span>
                <button
                  onClick={() => toggle(u.id, u.gov_subscribed)}
                  disabled={toggling === u.id}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border disabled:opacity-40
                             border-[#0A5440] text-[#0A5440] hover:bg-[#0A5440] hover:text-white">
                  {toggling === u.id ? '…' : u.gov_subscribed ? 'Revoke' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
