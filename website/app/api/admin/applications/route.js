import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await supabase
    .from('users').select('role, can_manage_accounts').eq('id', user.id).single()

  const isOwner = caller?.role === 'owner'
  const isAdminWithRights = caller?.role === 'admin' && caller?.can_manage_accounts
  if (!isOwner && !isAdminWithRights) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: pending } = await admin
    .from('users')
    .select('id, full_name, email, role, country, specialty, clinic_name, pharmacy_name, city, created_at')
    .eq('status', 'pending')
    .in('role', ['doctor', 'frontdesk', 'pharmacist'])
    .order('created_at', { ascending: true })

  const { data: rejected } = await admin
    .from('users')
    .select('id, full_name, email, role, country, created_at')
    .eq('status', 'rejected')
    .in('role', ['doctor', 'frontdesk', 'pharmacist'])
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ pending: pending ?? [], rejected: rejected ?? [] })
}
