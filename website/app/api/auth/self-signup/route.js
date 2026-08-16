import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

const PUBLIC_ROLES = ['patient', 'doctor', 'pharmacist', 'government', 'frontdesk']

export async function POST(request) {
  const { email, password, full_name, role, phone } = await request.json()

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (!PUBLIC_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: newUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 422 })
  }

  const PROVIDER_ROLES = ['doctor', 'frontdesk', 'pharmacist', 'government']
  const status = PROVIDER_ROLES.includes(role) ? 'pending' : 'active'

  const { error: profileErr } = await admin.from('users').insert({
    id: newUser.user.id,
    email,
    full_name,
    role,
    status,
    phone: phone ?? null,
    force_password_change: false,
  })

  if (profileErr) {
    await admin.auth.admin.deleteUser(newUser.user.id)
    return NextResponse.json({ error: profileErr.message }, { status: 422 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
