import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const headersList = await headers()
  const callerId = headersList.get('x-user-id')
  if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: caller } = await admin.from('users').select('role').eq('id', callerId).single()
  if (!['admin', 'analyst', 'owner'].includes(caller?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const PARTNER_ROLES = ['doctor', 'frontdesk', 'pharmacist', 'government']

  // Total counts per role + recent list
  const [usersRes, pharmaciesRes, monthlyRes] = await Promise.all([
    admin.from('users')
      .select('id, full_name, email, role, created_at')
      .in('role', PARTNER_ROLES)
      .order('created_at', { ascending: false }),

    admin.from('pharmacies')
      .select('id, name, address, phone, email, created_at')
      .order('created_at', { ascending: false }),

    // Monthly signups for last 12 months
    admin.from('users')
      .select('role, created_at')
      .in('role', PARTNER_ROLES)
      .gte('created_at', new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString()),
  ])

  const users     = usersRes.data     ?? []
  const pharmacies = pharmaciesRes.data ?? []
  const monthly   = monthlyRes.data   ?? []

  // Counts by role
  const counts = PARTNER_ROLES.reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length
    return acc
  }, {})
  counts.pharmacy_entity = pharmacies.length

  // Monthly growth — last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1); d.setHours(0, 0, 0, 0)
    d.setMonth(d.getMonth() - (5 - i))
    return {
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      start: d.toISOString(),
      end:   new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString(),
    }
  })

  const growth = months.map(m => ({
    label: m.label,
    doctor:     monthly.filter(u => u.role === 'doctor'     && u.created_at >= m.start && u.created_at < m.end).length,
    frontdesk:  monthly.filter(u => u.role === 'frontdesk'  && u.created_at >= m.start && u.created_at < m.end).length,
    pharmacist: monthly.filter(u => u.role === 'pharmacist' && u.created_at >= m.start && u.created_at < m.end).length,
    government: monthly.filter(u => u.role === 'government' && u.created_at >= m.start && u.created_at < m.end).length,
  }))

  return NextResponse.json({
    counts,
    recent: users.slice(0, 30),
    pharmacies: pharmacies.slice(0, 50),
    growth,
  })
}
