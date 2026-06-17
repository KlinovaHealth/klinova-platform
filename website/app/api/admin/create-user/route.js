import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'

// POST /api/admin/create-user
// Body: { email, full_name, role, temp_password, pharmacy_id? }
// Only admins may call this; identity verified via middleware-forwarded x-user-id header.
export async function POST(request) {
  // 1. Identify the caller from the middleware-verified header
  const headersList = await headers()
  const callerId = headersList.get('x-user-id')
  if (!callerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Confirm caller is an admin (service key — safe server-side)
  const adminSupabase = createAdminClient()
  const { data: callerProfile } = await adminSupabase
    .from('users')
    .select('role')
    .eq('id', callerId)
    .single()

  if (!['admin', 'owner'].includes(callerProfile?.role)) {
    return NextResponse.json({ error: 'Forbidden — admins and owners only' }, { status: 403 })
  }

  // 3. Parse and validate body
  const body = await request.json()
  const { email, full_name, role, temp_password, pharmacy_id } = body

  const VALID_ROLES = ['patient', 'doctor', 'pharmacist', 'admin', 'analyst', 'nurse', 'marketing', 'frontdesk', 'owner']
  if (!email || !role || !temp_password || !full_name) {
    return NextResponse.json({ error: 'email, full_name, role, and temp_password are required' }, { status: 400 })
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }, { status: 400 })
  }

  // 4. Create auth user via service key (server-side only — never in the browser)
  const { data: newAuthUser, error: createErr } = await adminSupabase.auth.admin.createUser({
    email,
    password: temp_password,
    email_confirm: true, // skip email verification for admin-created accounts
  })

  if (createErr) {
    return NextResponse.json({ error: createErr.message }, { status: 422 })
  }

  // 5. Insert into public.users
  const profileInsert = {
    id: newAuthUser.user.id,
    email,
    full_name,
    role,
    force_password_change: true, // force password change on first login
    ...(pharmacy_id && role === 'pharmacist' ? { pharmacy_id } : {}),
  }

  const { error: profileErr } = await adminSupabase
    .from('users')
    .insert(profileInsert)

  if (profileErr) {
    // Roll back auth user
    await adminSupabase.auth.admin.deleteUser(newAuthUser.user.id)
    return NextResponse.json({ error: profileErr.message }, { status: 422 })
  }

  return NextResponse.json({ success: true, userId: newAuthUser.user.id }, { status: 201 })
}
