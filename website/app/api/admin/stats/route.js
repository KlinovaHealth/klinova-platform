import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const headersList = await headers()
  const callerId = headersList.get('x-user-id')
  if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: caller } = await admin.from('users').select('role').eq('id', callerId).single()
  if (!['admin', 'analyst'].includes(caller?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [usersRes, consultsRes, pharmaciesRes, recentRes, pharmaListRes] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('consultations').select('*', { count: 'exact', head: true }).in('status', ['waiting', 'active']),
    admin.from('pharmacies').select('*', { count: 'exact', head: true }),
    admin.from('users').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }).limit(20),
    admin.from('pharmacies').select('id, name').order('name'),
  ])

  return NextResponse.json({
    userCount:     usersRes.count     ?? 0,
    activeConsults: consultsRes.count  ?? 0,
    pharmacyCount: pharmaciesRes.count ?? 0,
    recentUsers:   recentRes.data      ?? [],
    pharmacies:    pharmaListRes.data  ?? [],
  })
}
