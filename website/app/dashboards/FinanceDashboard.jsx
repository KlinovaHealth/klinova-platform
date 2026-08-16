'use client'
import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase-client'

const INCOME_CATS  = ['Government Contract','Grant / Funding','External Revenue','Refund','Other Income']
const EXPENSE_CATS = [
  'Rent / Office',
  'Electricity',
  'Water',
  'Internet & Phone',
  'Insurance',
  'Equipment & Hardware',
  'Office Supplies',
  'Cleaning & Maintenance',
  'Bank Charges',
  'Cloud Infrastructure',
  'Software & Tools',
  'Salaries & Payroll',
  'Marketing',
  'Legal & Compliance',
  'Travel',
  'Tax Paid',
  'Other Expense',
]
const CURRENCIES   = ['XOF','USD','GHS','NGN','EUR']

const PLATFORM_LABELS = {
  consultations:    { label: 'Consultations',      emoji: '🩺' },
  whatsapp_triage:  { label: 'WhatsApp Triage',    emoji: '💬' },
  gov_subscription: { label: 'Gov Subscriptions',  emoji: '🏛️' },
  pharmacy_order:   { label: 'Pharmacy Orders',    emoji: '💊' },
}

const PERIODS = ['This Month','Last 3 Months','This Year','All Time']

function fmt(n, cur = 'XOF') {
  if (!n) return `0 ${cur}`
  try {
    return new Intl.NumberFormat('fr-TG', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `${n.toLocaleString()} ${cur}`
  }
}

function inPeriod(dateStr, period) {
  if (period === 'All Time') return true
  const d = new Date(dateStr)
  const now = new Date()
  if (period === 'This Month')    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (period === 'Last 3 Months') return d >= new Date(now.getFullYear(), now.getMonth() - 2, 1)
  if (period === 'This Year')     return d.getFullYear() === now.getFullYear()
  return true
}

const fetcher = () => fetch('/api/finance').then(r => r.json())

export default function FinanceDashboard({ isOwner }) {
  const { data, mutate, isLoading } = useSWR('finance', fetcher, { refreshInterval: 60000 })

  const [period, setPeriod]       = useState('This Month')
  const [tab, setTab]             = useState('overview')
  const [showAdd, setShowAdd]     = useState(false)
  const [entryType, setEntryType] = useState('expense')
  const [form, setForm]           = useState({ category: '', description: '', amount: '', currency: 'XOF', entry_date: new Date().toISOString().slice(0,10), notes: '' })
  const [saving, setSaving]       = useState(false)
  const [accessEmail, setAccessEmail] = useState('')
  const [accessMsg, setAccessMsg]     = useState('')
  const [rateEdits, setRateEdits]     = useState({})
  const [taxEdit, setTaxEdit]         = useState('')

  const entries        = data?.entries        ?? []
  const rates          = data?.rates          ?? []
  const settings       = data?.settings       ?? {}
  const platformCounts = data?.platformCounts ?? {}

  const taxRate     = parseFloat(settings.tax_rate ?? '27')
  const mainCur     = settings.currency ?? 'XOF'

  // Platform auto-revenue
  const platformRevenue = useMemo(() => {
    return Object.entries(platformCounts).reduce((sum, [service, count]) => {
      const r = rates.find(r => r.service === service)
      return sum + (r ? r.rate * count : 0)
    }, 0)
  }, [platformCounts, rates])

  // Manual entries in period
  const filtered = useMemo(() => entries.filter(e => inPeriod(e.entry_date, period)), [entries, period])
  const manualIncome   = filtered.filter(e => e.type === 'income')  .reduce((s, e) => s + parseFloat(e.amount), 0)
  const manualExpenses = filtered.filter(e => e.type === 'expense') .reduce((s, e) => s + parseFloat(e.amount), 0)

  const totalRevenue = platformRevenue + manualIncome
  const netProfit    = totalRevenue - manualExpenses
  const estimatedTax = Math.max(0, netProfit * taxRate / 100)
  const afterTax     = netProfit - estimatedTax

  // 6-month chart data
  const chartData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('default', { month: 'short' })
      const inc = entries.filter(e => e.type === 'income'   && new Date(e.entry_date).getMonth() === d.getMonth() && new Date(e.entry_date).getFullYear() === d.getFullYear()).reduce((s,e) => s + parseFloat(e.amount), 0)
      const exp = entries.filter(e => e.type === 'expense'  && new Date(e.entry_date).getMonth() === d.getMonth() && new Date(e.entry_date).getFullYear() === d.getFullYear()).reduce((s,e) => s + parseFloat(e.amount), 0)
      months.push({ label, inc, exp })
    }
    const max = Math.max(...months.map(m => Math.max(m.inc, m.exp)), 1)
    return months.map(m => ({ ...m, incPct: (m.inc/max)*100, expPct: (m.exp/max)*100 }))
  }, [entries])

  async function post(body) {
    const res = await fetch('/api/finance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    return res.json()
  }

  async function addEntry() {
    if (!form.category || !form.amount) return
    setSaving(true)
    await post({ action: 'add_entry', type: entryType, ...form })
    mutate()
    setForm({ category: '', description: '', amount: '', currency: 'XOF', entry_date: new Date().toISOString().slice(0,10), notes: '' })
    setShowAdd(false)
    setSaving(false)
  }

  async function deleteEntry(id) {
    await post({ action: 'delete_entry', id })
    mutate()
  }

  async function grantAccess() {
    if (!accessEmail.trim()) return
    const r = await post({ action: 'grant_access', email: accessEmail.trim() })
    setAccessMsg(r.error ? `Not found: ${accessEmail}` : `Access granted to ${r.user?.full_name ?? accessEmail}`)
    if (!r.error) { setAccessEmail(''); mutate() }
    setTimeout(() => setAccessMsg(''), 4000)
  }

  async function revokeAccess(userId) {
    await post({ action: 'revoke_access', userId })
    mutate()
  }

  async function saveRate(service) {
    const val = rateEdits[service]
    if (!val) return
    await post({ action: 'update_rate', service, rate: val, currency: mainCur })
    setRateEdits(p => { const n={...p}; delete n[service]; return n })
    mutate()
  }

  async function saveTaxRate() {
    if (!taxEdit) return
    await post({ action: 'update_setting', key: 'tax_rate', value: taxEdit })
    setTaxEdit('')
    mutate()
  }

  const TABS = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'entries',   label: 'Entries'   },
    { id: 'settings',  label: 'Rates & Tax'},
    ...(isOwner ? [{ id: 'access', label: 'Access' }] : []),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-2xl font-semibold text-ink">
            Finance & Accounting
          </h2>
          <p className="text-sm text-ink/50 mt-0.5">Private · visible only to authorised users</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="text-xs border border-border rounded-lg px-3 py-1.5 bg-white text-ink focus:outline-none">
            {PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
          <button onClick={() => setShowAdd(s => !s)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0A5440] hover:opacity-90">
            + Add Entry
          </button>
        </div>
      </div>

      {/* Add entry form */}
      {showAdd && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink mb-4 text-sm">New Entry</h3>
          <div className="flex gap-2 mb-4">
            {['expense','income'].map(t => (
              <button key={t} onClick={() => setEntryType(t)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all"
                style={entryType === t
                  ? { background: t === 'income' ? '#0A5440' : '#C0392B', borderColor: 'transparent', color: '#fff' }
                  : { background: '#fff', borderColor: '#ddd', color: '#666' }}>
                {t === 'income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink/50 mb-1 block">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">Select…</option>
                {(entryType === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink/50 mb-1 block">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="e.g. June office rent"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-ink/50 mb-1 block">Amount *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))}
                  placeholder="0"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-ink/50 mb-1 block">Currency</label>
                <select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}
                  className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-ink/50 mb-1 block">Date</label>
              <input type="date" value={form.entry_date} onChange={e => setForm(f => ({...f, entry_date: e.target.value}))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-ink/50 mb-1 block">Notes</label>
              <input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                placeholder="Optional notes…"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addEntry} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0A5440] hover:opacity-90 disabled:opacity-40">
              {saving ? 'Saving…' : 'Save Entry'}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg text-sm border border-border text-ink/50 hover:bg-ivory">
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'border-b-2 border-[#0A5440] text-[#0A5440]' : 'text-ink/40 hover:text-ink/70'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FinCard label="Total Revenue" value={fmt(totalRevenue, mainCur)} sub={`Platform: ${fmt(platformRevenue, mainCur)}`} color="#0A5440" />
            <FinCard label="Total Expenses" value={fmt(manualExpenses, mainCur)} sub={`${filtered.filter(e=>e.type==='expense').length} entries`} color="#C0392B" />
            <FinCard label="Net Profit" value={fmt(netProfit, mainCur)} sub={netProfit >= 0 ? 'Profitable ✓' : 'Operating at loss'} color={netProfit >= 0 ? '#0A5440' : '#C0392B'} />
            <FinCard label={`Est. Tax (${taxRate}%)`} value={fmt(estimatedTax, mainCur)} sub={`After tax: ${fmt(afterTax, mainCur)}`} color="#D99A2B" />
          </div>

          {/* Platform revenue breakdown */}
          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-ink text-sm mb-3">Platform Revenue (Auto-calculated)</h3>
            <div className="space-y-2">
              {Object.entries(PLATFORM_LABELS).map(([service, { label, emoji }]) => {
                const count = platformCounts[service] ?? 0
                const rate  = rates.find(r => r.service === service)
                const rev   = rate ? rate.rate * count : 0
                return (
                  <div key={service} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{emoji}</span>
                      <span className="text-sm text-ink">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-ink">{fmt(rev, mainCur)}</span>
                      <span className="text-xs text-ink/40 ml-2">{count} × {fmt(rate?.rate ?? 0, mainCur)}</span>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-ink">Platform Total</span>
                <span className="text-sm font-bold text-[#0A5440]">{fmt(platformRevenue, mainCur)}</span>
              </div>
            </div>
          </section>

          {/* 6-month chart */}
          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-ink text-sm mb-4">6-Month Manual Entries</h3>
            <div className="flex items-end gap-3 h-32">
              {chartData.map(({ label, inc, exp, incPct, expPct }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: 100 }}>
                    <div className="w-4 rounded-t-sm bg-[#0A5440]/70 transition-all"
                      style={{ height: `${incPct}%`, minHeight: incPct > 0 ? 2 : 0 }}
                      title={`Income: ${fmt(inc, mainCur)}`} />
                    <div className="w-4 rounded-t-sm bg-[#C0392B]/70 transition-all"
                      style={{ height: `${expPct}%`, minHeight: expPct > 0 ? 2 : 0 }}
                      title={`Expenses: ${fmt(exp, mainCur)}`} />
                  </div>
                  <span className="text-xs text-ink/40">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-ink/50">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#0A5440]/70" /> Income</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#C0392B]/70" /> Expenses</span>
            </div>
          </section>
        </div>
      )}

      {/* ── ENTRIES ── */}
      {tab === 'entries' && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink text-sm mb-4">All Manual Entries · {period}</h3>
          {isLoading && <p className="text-sm text-ink/40 animate-pulse">Loading…</p>}
          {filtered.length === 0 && !isLoading && (
            <p className="text-sm text-ink/40">No entries for this period. Click &quot;+ Add Entry&quot; to start.</p>
          )}
          <div className="space-y-2">
            {filtered.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${e.type === 'income' ? 'bg-[#0A5440]' : 'bg-[#C0392B]'}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-ink font-medium truncate">{e.category}</p>
                    {e.description && <p className="text-xs text-ink/40 truncate">{e.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${e.type === 'income' ? 'text-[#0A5440]' : 'text-[#C0392B]'}`}>
                      {e.type === 'income' ? '+' : '-'}{fmt(parseFloat(e.amount), e.currency)}
                    </p>
                    <p className="text-xs text-ink/30">{new Date(e.entry_date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteEntry(e.id)} className="text-ink/20 hover:text-red-400 text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── RATES & TAX ── */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-ink text-sm mb-1">Per-Service Revenue Rates</h3>
            <p className="text-xs text-ink/40 mb-4">Set how much revenue each platform activity generates. Used to auto-calculate total revenue.</p>
            <div className="space-y-3">
              {Object.entries(PLATFORM_LABELS).map(([service, { label, emoji }]) => {
                const r   = rates.find(r => r.service === service)
                const val = rateEdits[service] ?? r?.rate ?? ''
                return (
                  <div key={service} className="flex items-center gap-3">
                    <span className="w-6 text-center">{emoji}</span>
                    <span className="text-sm text-ink flex-1">{label}</span>
                    <input type="number" value={val}
                      onChange={e => setRateEdits(p => ({...p, [service]: e.target.value}))}
                      className="w-32 border border-border rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none"
                      placeholder="0" />
                    <span className="text-xs text-ink/40 w-10">{mainCur}</span>
                    {isOwner && rateEdits[service] !== undefined && (
                      <button onClick={() => saveRate(service)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#0A5440] text-white hover:opacity-90">
                        Save
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-ink text-sm mb-1">Tax Rate</h3>
            <p className="text-xs text-ink/40 mb-4">Corporate tax rate used to estimate your tax liability. Togo standard: 27%.</p>
            <div className="flex items-center gap-3">
              <input type="number" value={taxEdit || taxRate}
                onChange={e => setTaxEdit(e.target.value)}
                className="w-24 border border-border rounded-lg px-3 py-2 text-sm text-right focus:outline-none"
                min="0" max="100" />
              <span className="text-sm text-ink/60">%</span>
              {isOwner && taxEdit && (
                <button onClick={saveTaxRate}
                  className="px-4 py-2 rounded-lg text-sm bg-[#0A5440] text-white hover:opacity-90">
                  Save
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── ACCESS (owner only) ── */}
      {tab === 'access' && isOwner && (
        <section className="bg-white rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-ink text-sm mb-1">Finance Access</h3>
          <p className="text-xs text-ink/40 mb-4">
            Only you and the people below can see this finance module. Add by their Klinova account email.
          </p>
          <div className="flex gap-2 mb-5">
            <input value={accessEmail} onChange={e => setAccessEmail(e.target.value)}
              placeholder="user@example.com"
              onKeyDown={e => e.key === 'Enter' && grantAccess()}
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <button onClick={grantAccess}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0A5440] hover:opacity-90">
              Grant Access
            </button>
          </div>
          {accessMsg && <p className="text-xs mb-3 text-amber-600">{accessMsg}</p>}
          <AccessList mutate={mutate} revokeAccess={revokeAccess} />
        </section>
      )}
    </div>
  )
}

function AccessList({ mutate, revokeAccess }) {
  const supabase = createClient()
  const { data: rows = [] } = useSWR('fin-access-list', async () => {
    const { data } = await supabase.from('fin_access').select('user_id, granted_at, users(full_name, email, role)')
    return data ?? []
  }, { refreshInterval: 10000 })

  if (rows.length === 0) return <p className="text-sm text-ink/40">No one else has access yet.</p>

  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.user_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <div>
            <p className="text-sm text-ink font-medium">{r.users?.full_name ?? '—'}</p>
            <p className="text-xs text-ink/40">{r.users?.email} · {r.users?.role}</p>
          </div>
          <button onClick={() => revokeAccess(r.user_id)}
            className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
            Revoke
          </button>
        </div>
      ))}
    </div>
  )
}

function FinCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-4">
      <p className="text-xs text-ink/50 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-ink/40 mt-1">{sub}</p>}
    </div>
  )
}
