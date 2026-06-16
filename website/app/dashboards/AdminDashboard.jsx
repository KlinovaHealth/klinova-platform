'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { StatCard, Table, StatusBadge, Alert } from './PatientDashboard'

const C = '#6A4C93'
const ROLES = ['patient', 'doctor', 'pharmacist', 'admin', 'analyst']

const fetchStats = () => fetch('/api/admin/stats').then(r => r.json())

export default function AdminDashboard({ userId, name }) {
  // All data comes from the admin API route (uses service key, bypasses RLS)
  const { data, mutate: mutateAll } = useSWR('admin-stats', fetchStats, { refreshInterval: 30000 })

  const userCount     = data?.userCount     ?? 0
  const activeCon     = data?.activeConsults ?? 0
  const pharmacyCount = data?.pharmacyCount  ?? 0
  const recentUsers   = data?.recentUsers    ?? []
  const pharmacies    = data?.pharmacies     ?? []

  function mutateUsers() { mutateAll() }

  // ── Create user form ──────────────────────────────────────
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

  const greet = () => {
    const h = new Date().getHours()
    const p = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
    return `Good ${p}${name ? `, ${name.split(' ')[0]}` : ''}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="text-2xl font-semibold text-ink">{greet()}</h2>
        <p className="text-sm text-ink/60 mt-0.5">Klinova administration.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total users"       value={userCount}   color={C} sub="all roles" />
        <StatCard label="Active consults"   value={activeCon}   color={C} sub="waiting + active" />
        <StatCard label="Pharmacies"        value={pharmacyCount} color={C} sub="registered" />
      </div>

      {/* Create user */}
      <section id="create" className="bg-white rounded-xl border border-border shadow-card p-5">
        <h3 className="font-semibold text-ink mb-1">Create account</h3>
        <p className="text-sm text-ink/55 mb-4">
          The user will be prompted to set their own password on first login.
        </p>

        {createError   && <Alert type="error"   msg={createError} />}
        {createSuccess && <Alert type="success" msg={createSuccess} />}

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" required>
            <input type="text" required value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className={inputCls} placeholder="Koffi Mensah" />
          </Field>
          <Field label="Email" required>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={inputCls} placeholder="koffi@example.com" />
          </Field>
          <Field label="Role" required>
            <select required value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className={inputCls}>
              {ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </Field>
          <Field label="Temporary password" required>
            <input type="text" required minLength={8} value={form.temp_password}
              onChange={e => setForm(f => ({ ...f, temp_password: e.target.value }))}
              className={inputCls} placeholder="Min. 8 characters" />
          </Field>
          {form.role === 'pharmacist' && (
            <Field label="Assign pharmacy" className="sm:col-span-2">
              <select value={form.pharmacy_id}
                onChange={e => setForm(f => ({ ...f, pharmacy_id: e.target.value }))}
                className={inputCls}>
                <option value="">No pharmacy assigned yet</option>
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
              {creating ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </section>

      {/* Recent users */}
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
    </div>
  )
}

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function RoleBadge({ role }) {
  const map = {
    patient:    { bg: '#E8F3EF', color: '#0E6B4F' },
    doctor:     { bg: '#E8F0F5', color: '#2C6E8F' },
    pharmacist: { bg: '#FBF4E5', color: '#D99A2B' },
    admin:      { bg: '#F0EBF7', color: '#6A4C93' },
    analyst:    { bg: '#E6F4F5', color: '#2C8C99' },
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

const inputCls = `w-full px-3 py-2.5 rounded-lg border border-border bg-ivory text-ink text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#6A4C93] focus:border-[#6A4C93]`
