'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'
import { StatCard, Table, Alert } from './PatientDashboard'
import CompanyFinancialsDashboard from './CompanyFinancialsDashboard'
import MyPaySection from './MyPaySection'

const C = '#4A1942'
const ALL_ROLES = ['patient', 'doctor', 'pharmacist', 'admin', 'analyst', 'nurse', 'marketing', 'frontdesk', 'owner']

function getGreeting(name) {
  const h = new Date().getHours()
  const p = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${p}${name ? `, ${name.split(' ')[0]}` : ''}`
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('fr-TG', { day: '2-digit', month: 'short', year: 'numeric' })
}

function RoleBadge({ role }) {
  const map = {
    patient:    { bg: '#E8F3EF', color: '#0E6B4F' },
    doctor:     { bg: '#E8F0F5', color: '#2C6E8F' },
    pharmacist: { bg: '#FBF4E5', color: '#D99A2B' },
    admin:      { bg: '#F0EBF7', color: '#6A4C93' },
    analyst:    { bg: '#E6F4F5', color: '#2C8C99' },
    nurse:      { bg: '#E5F3EF', color: '#2E7D6B' },
    marketing:  { bg: '#FEF3E2', color: '#B45309' },
    frontdesk:  { bg: '#E3EFFE', color: '#1565C0' },
    owner:      { bg: '#F3E8F2', color: '#4A1942' },
  }
  const s = map[role] ?? { bg: '#F5EFE3', color: '#15302A' }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {role}
    </span>
  )
}

export default function OwnerDashboard({ userId, name, financeAdmin }) {
  const supabase = createClient()

  const { data: userCount = 0 } = useSWR('owner-user-count', async () => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
    return count ?? 0
  }, { refreshInterval: 30000 })

  const { data: activeCon = 0 } = useSWR('owner-active-consults', async () => {
    const { count } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['waiting', 'active'])
    return count ?? 0
  }, { refreshInterval: 15000 })

  const { data: pharmacyCount = 0 } = useSWR('owner-pharmacy-count', async () => {
    const { count } = await supabase.from('pharmacies').select('*', { count: 'exact', head: true })
    return count ?? 0
  }, { refreshInterval: 60000 })

  const { data: recentUsers = [], mutate: mutateUsers } = useSWR('owner-recent-users', async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
    return data ?? []
  }, { refreshInterval: 30000 })

  const { data: pharmacies = [] } = useSWR('owner-pharmacies-list', async () => {
    const { data } = await supabase.from('pharmacies').select('id, name').order('name')
    return data ?? []
  })

  const empty = { email: '', full_name: '', role: 'patient', temp_password: '', pharmacy_id: '' }
  const [form, setForm]         = useState(empty)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError]   = useState('')
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
      setCreateSuccess(`Account created for ${form.full_name}. They'll be prompted to set a new password on first login.`)
      setForm(empty)
      mutateUsers()
    }
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{getGreeting(name)}</h2>
        <p className="text-sm text-ink/60 mt-0.5">Klinova owner overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total users"     value={userCount}     color={C} sub="all roles" />
        <StatCard label="Active consults" value={activeCon}     color={C} sub="waiting + active" />
        <StatCard label="Pharmacies"      value={pharmacyCount} color={C} sub="registered" />
      </div>

      {financeAdmin && <CompanyFinancialsDashboard />}

      <section id="create" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">Create account</h3>
        <p className="text-sm text-ink/55 mb-4">
          The user will be prompted to set their own password on first login.
        </p>

        {createError   && <Alert type="error"   msg={createError} />}
        {createSuccess && <Alert type="success" msg={createSuccess} />}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OField label="Full name" required>
            <input type="text" required value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className={inputCls} placeholder="Koffi Mensah" />
          </OField>
          <OField label="Email" required>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={inputCls} placeholder="koffi@example.com" />
          </OField>
          <OField label="Role" required>
            <select required value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className={inputCls}>
              {ALL_ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </OField>
          <OField label="Temporary password" required>
            <input type="text" required minLength={8} value={form.temp_password}
              onChange={e => setForm(f => ({ ...f, temp_password: e.target.value }))}
              className={inputCls} placeholder="Min. 8 characters" />
          </OField>
          {form.role === 'pharmacist' && (
            <OField label="Assign pharmacy" className="sm:col-span-2">
              <select value={form.pharmacy_id}
                onChange={e => setForm(f => ({ ...f, pharmacy_id: e.target.value }))}
                className={inputCls}>
                <option value="">No pharmacy assigned yet</option>
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
              {creating ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </section>

      <section id="users" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-4">Recent accounts</h3>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-ink/50">No users yet.</p>
        ) : (
          <Table
            cols={['Name', 'Email', 'Role', 'Created']}
            rows={recentUsers.map(u => [
              u.full_name ?? '—',
              u.email ?? '—',
              <RoleBadge key={u.id} role={u.role} />,
              fmtDate(u.created_at),
            ])}
          />
        )}
      </section>

      <MyPaySection userId={userId} />
    </div>
  )
}

function OField({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#4A1942] focus:border-[#4A1942]`
