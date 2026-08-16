import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(request) {
  const headersList = await headers()
  const callerId = headersList.get('x-user-id')
  if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: caller } = await admin.from('users').select('role').eq('id', callerId).single()
  if (!['admin', 'owner'].includes(caller?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, address, phone, email } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Pharmacy name is required' }, { status: 400 })

  const { data, error } = await admin
    .from('pharmacies')
    .insert({ name: name.trim(), address: address?.trim() || null, phone: phone?.trim() || null, email: email?.trim() || null })
    .select('id, name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 422 })
  return NextResponse.json({ success: true, pharmacy: data }, { status: 201 })
}
